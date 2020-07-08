import { Theme, TableRow, TableCell, withStyles, TableBody, Checkbox, IconButton, Tooltip, Avatar } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { Component } from "react";
import React from "react";
import ClearIcon from "@material-ui/icons/Clear";
import CheckIcon from "@material-ui/icons/Check";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { GlobalContext } from "../../../../utils/contexts";
import { DBMemberData } from "../../../../http_utils/HTTPMembers";
import { DBMemberDataExtended } from "../../../../http_utils/HTTPAuth";
import { IconType, Column } from "./ManagementTable";
import { getHighestRole } from "../../../../pages/Profile";


const styles = (theme: Theme) => ({
  cell: {
    borderColor: theme.palette.secondary.main,
    borderWidth: 1,
    wordWrap: "break-word" as "break-word",
    maxWidth: theme.spacing(11),
  },
  cellContent: {
    maxHeight: theme.spacing(8),
    textOverflow: "ellipsis",
    overflow: "hidden" as "hidden"
  },
});

type DBMemberDataProcessed = {
  applicationStatus: {
    stage: string;
  };
} & DBMemberData;
  
interface Props {
  classes: Classes;
  theme: Theme;
  columns: Column[];
  rows: DBMemberData[];
  onCheckboxChange: (rowId: number, columnName: string) => () => void;
  onIconButtonClick: (iconType: IconType, _id: string) => () => void;
}

class ManagementHead extends Component<Props> {
  static contextType = GlobalContext;

  constructor(props: Props) {
    super(props);

    this.onCopy = this.onCopy.bind(this);
  }

  onCopy(discordId: string) {
    return () => {
      const memberData = this.props.rows.find(row => row.discordId === discordId);
      let discordName = discordId;
      if(memberData) discordName = memberData.discordName;
      this.context.toggleNotification(true, { type: "success", message: `Copied @${discordName} to clipboard`, hideDelay: 1000 });
      this.context.copyToClipboard(`<@${discordId}>`);
    }
  }

  render() {
    const { classes, rows, columns, onCheckboxChange, onIconButtonClick } = this.props;

    const memberData: DBMemberDataExtended = this.context.memberData;

    const processedRows = processRows(rows);
    surfaceNested(processedRows);

    return (
      <>
        <TableBody>
          {
            processedRows.map((row: DBMemberDataProcessed) => {
              const highestRole = getHighestRole(row);
              return (
                <TableRow key={row._id}>
                  <TableCell
                    key={`avatars_${row._id}`}
                    align="center"
                    className={classes.cell}
                    style={{ paddingRight: 0 }}
                  >
                    <Tooltip title={row.discordName} placement="bottom" PopperProps={{ disablePortal: true }}>
                      <Avatar alt={row.discordName} src={row.discordAvatar}
                      >{row.discordName.charAt(0).toUpperCase()}</Avatar>
                    </Tooltip>
                  </TableCell>
                  {
                    columns.map((column: Column) => {
                      return (
                        <TableCell
                          key={`${column.name}_${row._id}`}
                          align="center"
                          className={classes.cell}
                          style={(row.confirmedByAdmiralty) ? {opacity: 0.4} : {}}
                        >
                          {
                            (column.name === "discordName") ?
                              <>
                                <span style={{
                                  fontSize: 12,
                                  color: `#${highestRole.color.toString(16)}`
                                }}
                                className={classes.cellContent}
                                >
                                  [{highestRole.name}]
                                </span>
                                <br/>
                              </>
                            : null
                          } {
                            (column.isBool) ?
                              <Checkbox
                                onChange={
                                  (!column.disabled) ?
                                    onCheckboxChange(rows.map(row1 => {
                                      return row1._id;
                                    }).indexOf(row._id), column.name)
                                    : () => {}
                                }
                                value={(row[column.name]) ? row[column.name] : ""}
                                checked={row[column.name]}
                                disableRipple={row.confirmedByAdmiralty || column.disabled}
                                disabled={true}
                              />
                            : <div className={classes.cellContent}>{row[column.name]}</div>
                          } {
                            (column.name === "discordName") ?
                              <>
                                <IconButton onClick={this.onCopy(row.discordId)} size="small" color="secondary">
                                  <Tooltip title="Copy @ ID" aria-label="copy discord id">
                                    <FileCopyIcon fontSize="small" color="secondary"/>
                                  </Tooltip>
                                </IconButton>
                              </>
                            : null
                          }
                        </TableCell>
                      )
                    })
                  }
                  <TableCell key={`actions1_${row._id}`} align="center" className={classes.cell}>
                    {
                      (
                        row.applicationStatus.stage === "Reviewed" &&
                        row.joinedSquadron &&
                        row.joinedInaraSquadron &&
                        row.inaraName.length > 0 &&
                        row.inGameName.length > 0
                      ) ?
                        (memberData.webPerms["complete-application"]) ?
                          <IconButton onClick={onIconButtonClick("complete", row._id)} color="secondary">
                            <Tooltip title="Complete Application" aria-label="complete application">
                              <CheckIcon color="secondary"/>
                            </Tooltip>
                          </IconButton>
                        : null
                      :
                        (memberData.webPerms["revert-application"]) ?
                          (row.applicationStatus.stage === "Completed") ?
                            <IconButton onClick={onIconButtonClick("revert", row._id)} color="secondary">
                              <Tooltip title="Revert Application" aria-label="revert application">
                                <ClearIcon color="secondary"/>
                              </Tooltip>
                            </IconButton>
                          : null
                        : null

                    }
                    {
                      (memberData.webPerms["create-revision-request"]) ?
                        (row.applicationStatus.stage === "In Progress" || row.applicationStatus.stage === "Reviewed") ?
                          <IconButton onClick={onIconButtonClick("request", row._id)} color="secondary">
                            {
                              <Tooltip title="Request Revision" aria-label="request revision">
                                <NotificationsActiveIcon color="secondary"/>
                              </Tooltip>
                            }
                          </IconButton>
                        : null
                      : null
                    }
                  </TableCell>
                  <TableCell key={`actions2_${row._id}`} align="center" className={classes.cell}>
                    {
                      (memberData.webPerms["edit-member"]) ?
                        (row.applicationStatus.stage !== "Completed") ?
                          <IconButton onClick={onIconButtonClick("edit", row._id)} color="secondary">
                            <Tooltip title="Edit" aria-label="edit member">
                              <EditIcon color="secondary"/>
                            </Tooltip>
                          </IconButton>
                        : null
                      : null
                    }
                    <IconButton onClick={onIconButtonClick("requests", row._id)} color="secondary">
                      <Tooltip title="View Revision Requests" aria-label="review revision messages">
                        <VisibilityIcon color="secondary"/>
                      </Tooltip>
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </>
    )
  }
}

const surfaceNested = (data: DBMemberData[]) => {
  for(const i in data) {
    const entry = data[i];
    for(const ii in entry) {
      const cell = entry[ii];
      if(typeof cell === "object") {
        for(const iii in cell) {
          const nested = cell[iii];
          const name = `${ii}.${iii}`;
          data[i][name] = nested;
        }
      }
    }
  }
}

const processRows = (rows: DBMemberData[]): DBMemberDataProcessed[] => {
  const processedRows: any[] = [];
  for(const i in rows) {
    const row = rows[i];
    const stages = ["Not Started", "In Progress", "Reviewed", "Completed"];
    processedRows.push({ ...rows[i] });
    processedRows[i].applicationStatus.stage = stages[row.applicationStatus.stage];
  }
  return processedRows;
}

export default withStyles(styles, { withTheme: true })(ManagementHead);