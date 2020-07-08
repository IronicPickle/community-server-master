import React, { Component } from "react";
import { withStyles, Theme, Container, Paper, Toolbar, Grid, Typography, IconButton, Tooltip } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../utils/contexts";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ApplicationProgress from "../components/sections/profile/ApplicationProgress";
import GenericInfo from "../components/sections/profile/GenericInfo";
import DiscordInfo from "../components/sections/profile/DiscordInfo";
import SubmittedInfo from "../components/sections/profile/SubmittedInfo";
import ApplicationInfo from "../components/sections/profile/ApplicationInfo";
import { DBMemberDataExtended } from "../http_utils/HTTPAuth";
import { DiscordRole, DBMemberData } from "../http_utils/HTTPMembers";

const styles = (theme: Theme) => ({
  mainContainer: {
    minWidth: 800,
    marginTop: theme.spacing(12),
    marginBottom: theme.spacing(8)
  },

  profileContainer: {
    position: "relative" as "relative",
    marginTop: theme.spacing(1)
  },

  profileGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }, profileGridLeft: {
    width: theme.spacing(24)
  }, profileGridRight: {
    width: `calc(100% - ${theme.spacing(28)}px)`,
    marginLeft: theme.spacing(4)
  }
});

interface Props {
  classes: Classes;
  theme: Theme;
}

class Profile extends Component<Props> {
  static contextType = GlobalContext;

  constructor(props: Props) {
    super(props);

    this.onViewRequests = this.onViewRequests.bind(this);
  }

  onViewRequests() {
    this.context.toggleContainer("requestsMember", true, null, this.context.memberData );
  }
  
  render() {
    const { classes } = this.props;

    const memberData: DBMemberDataExtended | undefined = this.context.memberData;
    if(!memberData) return null;
    let highestRole: DiscordRole = getHighestRole(memberData);

    return (
      <>
        <Container className={classes.mainContainer}>
          <Paper>
            <Toolbar>
              <div>
                <Typography variant="h6" component="h6" align="center" noWrap
                  >Application Progress</Typography>
              </div>
              <ApplicationProgress memberData={memberData} />
              <IconButton onClick={this.onViewRequests} color="secondary">
                <Tooltip title="View Revision Requests" aria-label="review revision messages">
                  <VisibilityIcon color="secondary"/>
                </Tooltip>
              </IconButton>
            </Toolbar>
          </Paper>
          <Paper className={classes.profileContainer}>
            <Container>
              <Grid container className={classes.profileGrid} justify="flex-start" wrap="nowrap">
                <Grid item className={classes.profileGridLeft}>
                  <GenericInfo memberData={memberData} highestRole={highestRole} />
                </Grid>
                <Grid item className={classes.profileGridRight}>

                  <Grid container justify="flex-start" wrap="nowrap" spacing={2}>
                    <Grid item sm={4}>
                      <DiscordInfo memberData={memberData} />
                    </Grid>
                    <Grid item sm={4}>
                      <SubmittedInfo memberData={memberData} />
                    </Grid>
                    <Grid item sm={4}>
                      <ApplicationInfo memberData={memberData} />
                    </Grid>
                  </Grid>

                </Grid>
              </Grid>
            </Container>
          </Paper>
        </Container>
      </>
    );
  }
}

export function getHighestRole(memberData: DBMemberData): DiscordRole {
  let highestRole: any = memberData.discordRoles[0];
  for(const i in memberData.discordRoles) {
    const role = memberData.discordRoles[i];
    if(role.rawPosition > highestRole.rawPosition) highestRole = role;
  }
  if(highestRole.name === "@everyone") highestRole.name = "No Role";
  return highestRole;
}

export default withStyles(styles, { withTheme: true })(Profile);