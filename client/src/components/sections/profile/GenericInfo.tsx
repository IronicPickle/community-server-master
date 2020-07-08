import React, { Component } from "react";
import { Theme, Typography, withStyles, Avatar } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { DBMemberDataExtended } from "../../../http_utils/HTTPAuth";
import { DiscordRole } from "../../../http_utils/HTTPMembers";

const styles = (theme: Theme) => ({
  profileName: {
    margin: 0,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  }, profileRole: {
    padding: 0,
    paddingTop: theme.spacing(2)
  }, profileAvatar: {
    marginRight: theme.spacing(4),
    marginLeft: theme.spacing(4),
    width: 128,
    height: 128
  }
});

interface Props {
  classes: Classes;
  memberData: DBMemberDataExtended;
  highestRole: DiscordRole;
}

class GenericInfo extends Component<Props> {
  
  render() {
    const { classes, memberData, highestRole } = this.props;

    return (
      <>
        <Typography
          variant="h6"
          component="h6"
          align="center"
          noWrap={true}
          className={classes.profileName}
        >
          {memberData.discordName}
        </Typography>
          <Avatar variant="rounded" alt={memberData.discordName} src={memberData.discordAvatar} className={classes.profileAvatar}
          >{memberData.discordName.charAt(0).toUpperCase()}</Avatar>
        <Typography
          variant="body2"
          component="p"
          align="center"
          noWrap={true}
          className={classes.profileRole}
        >
          <span style={{ color: `#${highestRole.color.toString(16)}` }}>
            [{highestRole.name}]
          </span><br/>
        </Typography>
      </>
    );
  }
}

export default withStyles(styles)(GenericInfo);