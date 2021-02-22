import React, { Component } from "react";
import { Theme, Container, Paper, Toolbar, Grid, Typography, Divider} from "@material-ui/core";
import { globalContext } from "../utils/contexts";
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import GenericInfo from "../components/sections/profile/GenericInfo";
import DiscordInfo from "../components/sections/profile/DiscordInfo";
import { DBMemberDataExtended } from "../http_utils/HTTPAuth";
import { DiscordRole, DBMemberData } from "../http_utils/HTTPMembers";
import withStyles, { ClassNameMap } from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(10),
    minHeight: theme.spacing(40),

    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4)
  },
  titleContainer: {
    paddingTop: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
  titleIcon: {
    width: theme.spacing(6),
    height: theme.spacing(6)
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
  classes: ClassNameMap;
  theme: Theme;
}

class Profile extends Component<Props> {
  static contextType = globalContext;

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
            <Toolbar className={classes.titleContainer}>
              <Grid container justify="flex-start">
                <Toolbar style={{ padding: 0 }}>
                  <AccountBoxIcon className={classes.titleIcon}/>
                </Toolbar>
              </Grid>
              <Grid container justify="center">
                <Toolbar style={{ padding: 0 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    noWrap
                  >Profile
                  </Typography>
                </Toolbar>
              </Grid>
              <Grid container justify="flex-end" />
            </Toolbar>
            <Divider />
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