import React, { Component } from "react";
import { Theme, Typography, withStyles, Card, CardContent, Divider, Tooltip } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { DBMemberDataExtended } from "../../../http_utils/HTTPAuth";
import { DiscordRole } from "../../../http_utils/HTTPMembers";

const styles = (theme: Theme) => ({
  profileCard: {
    backgroundColor: theme.palette.primary.dark
  }, profileCardDivider: {
    backgroundColor: theme.palette.secondary.dark,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
});

interface Props {
  classes: Classes;
  memberData: DBMemberDataExtended;
}

class DiscordInfo extends Component<Props> {
  
  render() {
    const { classes, memberData } = this.props;

    const discordRolesString = memberData.discordRoles.map((role: DiscordRole) => {
      return (role.name !== "@everyone") ?
        <span key={role.id}>
          <span style={{color: `#${role.color.toString(16)}`,}}>
            ⬤ &nbsp;
          </span>
          {role.name}<br/>
        </span>
      : null
    })

    return (
      <>
        <Card className={classes.profileCard}>
          <CardContent>
            <Typography variant="h6" component="h6" align="center" noWrap
            >Discord Information</Typography>
            <Divider className={classes.profileCardDivider} variant="middle" />
            <Typography variant="caption" component="p" align="center" noWrap
            >Discord Name</Typography>
            <Typography variant="body1" component="p" align="center" noWrap
            >{memberData.discordName}</Typography>
            <Divider className={classes.profileCardDivider} variant="middle" />
            <Typography variant="caption" component="p" align="center" noWrap
            >Discord Roles</Typography>
            <Tooltip title={discordRolesString} aria-label="discord roles">
              <Typography variant="body1" component="p" align="center"
                >{memberData.discordRoles.length - 1} Roles (Hover to View)</Typography>
              </Tooltip>
          </CardContent>
        </Card>
      </>
    );
  }
}

export default withStyles(styles)(DiscordInfo);