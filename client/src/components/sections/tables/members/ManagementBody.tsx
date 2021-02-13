import { Theme, TableRow, TableCell, withStyles, TableBody, Checkbox, IconButton, Tooltip, Avatar } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { Component } from "react";
import React from "react";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { GlobalContext } from "../../../../utils/contexts";
import { DBMemberData } from "../../../../http_utils/HTTPMembers";
import { DBMemberDataExtended } from "../../../../http_utils/HTTPAuth";
import { IconType, Column } from "./ManagementTable";
import { getHighestRole } from "../../../../pages/Profile";
import moment from "moment";


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
    const processedRows = processRows(rows);
    console.log(processedRows)

    const memberData: DBMemberDataExtended = this.context.memberData;

    surfaceNested(rows);

    return (
      <>
        <TableBody>
          {
            processedRows.map((row: DBMemberData) => {
              const highestRole = getHighestRole(row);
              return (
                <TableRow key={row._id}>
                  <TableCell
                    key={`avatars_${row._id}`}
                    align="center"
                    className={classes.cell}
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

const processRows = (rows: DBMemberData[]): DBMemberData[] => {
  const processedRows: DBMemberData[] = [];
  for(const i in rows) {
    processedRows.push(rows[i]);
    processedRows[i].joinDate = moment(processedRows[i].joinDate).format("hh:mm DD/MM/YYYY");
  }
  return processedRows;
}

export default withStyles(styles, { withTheme: true })(ManagementHead);