import { Theme, TableRow, TableCell, withStyles, TableBody, Checkbox, IconButton, Tooltip, Avatar, Grid } from "@material-ui/core";
import { Component } from "react";
import React from "react";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { globalContext } from "../../../../utils/contexts";
import { DBMemberData } from "../../../../http_utils/HTTPMembers";
import { Column } from "./ManagementTable";
import { getHighestRole } from "../../../../pages/Profile";
import moment from "moment";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";


const styles = (theme: Theme) => ({
  cell: {
    borderWidth: 1,
    wordWrap: "break-word" as "break-word",
    maxWidth: theme.spacing(12),
  },
  cellContent: {
    maxHeight: theme.spacing(8),
    textOverflow: "ellipsis",
    overflow: "hidden" as "hidden"
  },
  joinDate: {
    color: theme.palette.secondary.main
  }
});
  
interface Props {
  classes: ClassNameMap;
  theme: Theme;
  columns: Column[];
  rows: DBMemberData[];
}

class ManagementHead extends Component<Props> {
  static contextType = globalContext;

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
    const { classes, rows } = this.props;
    surfaceNested(rows);

    return (
      <>
        <TableBody>
          {
            rows.map((row: DBMemberData) => {
              const highestRole = getHighestRole(row);
              return (
                <TableRow key={row._id}>
                  <TableCell key={`avatars_${row._id}`} align="center" variant="body" className={classes.cell}>
                    <Grid container justify="center">
                      <Tooltip title={row.discordName} placement="bottom" PopperProps={{ disablePortal: true }}>
                        <Avatar alt={row.discordName} src={row.discordAvatar}
                        >{row.discordName.charAt(0).toUpperCase()}</Avatar>
                      </Tooltip>
                    </Grid>
                  </TableCell>
                  <TableCell key={`discordName_${row._id}`} align="center" variant="body" className={classes.cell}>
                    <span style={{ fontSize: 12, color: `#${highestRole.color.toString(16)}` }}
                      className={classes.cellContent}
                    >[{highestRole.name}]</span>
                    <br/>{row.discordName}<br/>
                    <IconButton onClick={this.onCopy(row.discordId)} size="small" color="secondary">
                      <Tooltip title="Copy @ ID" aria-label="copy discord id">
                        <FileCopyIcon fontSize="small" color="secondary"/>
                      </Tooltip>
                    </IconButton>
                  </TableCell>
                  <TableCell key={`joinDate_${row._id}`} align="center" variant="body" className={classes.cell}>
                    <span>{ moment(row.joinDate).fromNow() }</span><br/>
                    <span className={classes.joinDate}>{ moment(row.joinDate).format("hh:mm DD/MM/YYYY") }</span>
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

export default withStyles(styles, { withTheme: true })(ManagementHead);