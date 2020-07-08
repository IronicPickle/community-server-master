import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Theme, Tabs, Tab, Grid, IconButton, Tooltip, Avatar, Divider } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { Link } from "react-router-dom";
import { GlobalContext } from "../../utils/contexts";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import NoMeetingRoomIcon from "@material-ui/icons/NoMeetingRoom";
import { DBMemberDataExtended } from "../../http_utils/HTTPAuth";
import { DiscordRole } from "../../http_utils/HTTPMembers";
import { getHighestRole } from "../../pages/Profile";

const styles = (theme: Theme) => ({
  title: {
    textDecoration: "none",
    marginRight: 24,
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  }, logo: {
    height: theme.spacing(6)
  }, divider: {
    backgroundColor: theme.palette.secondary.dark,
    height: theme.spacing(5)
  }, discordName: {
    maxWidth: theme.spacing(32),
    overflow: "hidden" as "hidden",
    whiteSpace: "nowrap" as "nowrap",
    textOverflow: "ellipsis"
  }
});

interface Props {
  classes: Classes;
  theme: Theme;
  currentRoute: string;
}  

class Layout extends Component<Props> {
  static contextType = GlobalContext;
  
  logout() {
    window.location.replace("/auth/logout");
  }

  login() {
    window.location.replace("/auth/login");
  }

  checkRouteExists(route: string): boolean {
    for(var i in tabRoutes) {
      if(tabRoutes[i].path === route) return true
    }
    return false;
  }

  render() {
    const { classes, theme } = this.props;

    const loggedIn: boolean = this.context.loggedIn;
    const memberData: DBMemberDataExtended | undefined = this.context.memberData;
    let highestRole: DiscordRole | null = null;
    if(memberData) highestRole = getHighestRole(memberData);

    return (
      <>
        <>
          <AppBar>
            <Toolbar>
              <Grid container justify="flex-start">
                <Grid item>
                  <Toolbar style={{ padding: 0 }}>
                    <Link to="/">
                      <img src="/images/logo_simple.png" alt="Logo" className={classes.logo} />
                    </Link>
                    <Link to="/">
                      <Typography
                        variant="h5"
                        component="h5"
                        className={classes.title}
                      >IP3X</Typography>
                    </Link>
                  </Toolbar>
                </Grid>
              </Grid>
              <Grid container justify="center">
                <Grid item>
                  <Toolbar style={{ padding: 0 }}>
                    <Tabs value={this.checkRouteExists(this.props.currentRoute) ? this.props.currentRoute : false}>
                      {
                        tabRoutes.map(route => {
                          let visible = true;
                          if(route.perm) visible = loggedIn;
                          if(route.perm && memberData) visible = memberData.webPerms[route.perm];
                          return <Tab component={Link} to={route.path} key={route.path} value={route.path} label={route.name} style={{ display: (visible) ? "inherit" : "none" }} />
                          
                        })
                      }
                    </Tabs>
                  </Toolbar>
                </Grid>
              </Grid>
              <Grid container justify="flex-end">
                <Grid item>
                  <Toolbar style={{ padding: 0 }}>
                  {(loggedIn && memberData) ? 
                    <>
                      <Divider className={classes.divider} orientation="vertical" variant="middle" />

                      <Typography
                        variant="body2"
                        component="p"
                        align="center"
                        style={{ marginRight: theme.spacing(1) }}
                        noWrap
                      >
                        {
                          (highestRole) ?
                            <>
                              <span style={{ color: `#${highestRole.color.toString(16)}`, fontSize: 12 }}>
                                [{highestRole.name}]
                              </span><br/>
                            </>
                          : "No Role"
                        }
                        
                        {
                          (memberData.webPerms["view-profile-page"]) ?
                            <Link to="/profile">{
                              <span className={classes.discordName}>{memberData.discordName}</span>
                            }</Link>
                          : <span className={classes.discordName}>{memberData.discordName}</span>
                        }
                      </Typography>
    
                      <Tooltip title={memberData.discordName} placement="bottom" PopperProps={{ disablePortal: true }}>
                        {
                          (memberData.webPerms["view-profile-page"]) ?
                            <Link to="/profile">
                              <IconButton size="small" color="secondary">
                                <Avatar alt={memberData.discordName} src={memberData.discordAvatar}
                                >{memberData.discordName.charAt(0).toUpperCase()}</Avatar>
                              </IconButton>
                            </Link>
                          :
                            <IconButton size="small" color="secondary">
                              <Avatar alt={memberData.discordName} src={memberData.discordAvatar}
                              >{memberData.discordName.charAt(0).toUpperCase()}</Avatar>
                            </IconButton>
                        }
                        
                      </Tooltip>

                      <Divider className={classes.divider} orientation="vertical" variant="middle" style={{ marginRight: theme.spacing(3) }} />

                      <Tooltip title={"Log Out"} placement="bottom" PopperProps={{ disablePortal: true }}>
                        <IconButton onClick={this.logout} color="secondary">
                          <NoMeetingRoomIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  :
                    <>
                      <Divider className={classes.divider} orientation="vertical" variant="middle" style={{ marginRight: theme.spacing(3) }} />
                        <Tooltip title={"Log In"} placement="bottom" PopperProps={{ disablePortal: true }}>
                          <IconButton onClick={this.login} color="secondary">
                            <MeetingRoomIcon />
                          </IconButton>
                        </Tooltip>
                    </>
                  }
                  </Toolbar>
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
        </>

        {this.props.children}
      </>
    )
  }
}

const tabRoutes = [
  {path: "/", name: "Home"},
  {path: "/management", name: "Management", perm: "view-management-page"},
  //{path: "/stats", name: "Stats", perm: "view-stats-page"},
  {path: "/bgs", name: "Background-Sim", perm: "view-bgs-page"}

]

export default withStyles(styles, { withTheme: true })(Layout);