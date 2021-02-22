import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Theme, Tabs, Tab, Grid, IconButton, Tooltip, Avatar, Divider, LinearProgress } from "@material-ui/core";
import { Link } from "react-router-dom";
import { GlobalContext, globalContext } from "../../utils/contexts";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import NoMeetingRoomIcon from "@material-ui/icons/NoMeetingRoom";
import Brightness5Icon from "@material-ui/icons/Brightness5";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import { DBMemberDataExtended } from "../../http_utils/HTTPAuth";
import { DiscordRole } from "../../http_utils/HTTPMembers";
import { getHighestRole } from "../../pages/Profile";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
  title: {
    textDecoration: "none",
    marginRight: 24,
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  }, logo: {
    height: theme.spacing(6)
  }, divider: {
    height: theme.spacing(5)
  }, discordName: {
    maxWidth: theme.spacing(32),
    overflow: "hidden" as "hidden",
    whiteSpace: "nowrap" as "nowrap",
    textOverflow: "ellipsis"
  }
});

interface Props {
  classes: ClassNameMap;
  theme: Theme;
  currentRoute: string;
  loading: boolean;
}  

class Layout extends Component<Props> {
  static contextType = globalContext;
  
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
    const { classes, theme, loading } = this.props;
    const { selectedTheme, toggleTheme } = this.context as GlobalContext;

    const loggedIn: boolean = this.context.loggedIn;
    const memberData: DBMemberDataExtended | undefined = this.context.memberData;
    let highestRole: DiscordRole | null = null;
    if(memberData) highestRole = getHighestRole(memberData);

    return (
      <>
        <>
          <AppBar>
            <div style={{ position: "absolute" as "absolute", width: "100%" }}>
              <LinearProgress variant="query" hidden={!loading} color="secondary" />
            </div>
            <Toolbar>
              <Grid container justify="flex-start">
                <Grid item>
                  <Toolbar style={{ padding: 0 }}>
                    <Link to="/">
                      <img src="/images/logo.png" alt="Logo" className={classes.logo} />
                    </Link>
                    <Link to="/">
                      <Typography
                        variant="h5"
                        component="h5"
                        className={classes.title}
                      >Lykos</Typography>
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
                          return <Tab
                            component={Link}
                            to={route.path}
                            key={route.path}
                            value={route.path}
                            label={route.name}
                            style={{ display: (visible) ? "inherit" : "none" }}
                          />
                        })
                      }
                    </Tabs>
                  </Toolbar>
                </Grid>
              </Grid>
              <Grid container justify="flex-end">
                <Grid item>
                  <Toolbar style={{ padding: 0 }}>
                    {(loggedIn && memberData != null) ? 
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
                                <IconButton size="small">
                                  <Avatar alt={memberData.discordName} src={memberData.discordAvatar}
                                  >{memberData.discordName.charAt(0).toUpperCase()}</Avatar>
                                </IconButton>
                              </Link>
                            :
                              <IconButton size="small">
                                <Avatar alt={memberData.discordName} src={memberData.discordAvatar}
                                >{memberData.discordName.charAt(0).toUpperCase()}</Avatar>
                              </IconButton>
                          }
                          
                        </Tooltip>

                        <Divider className={classes.divider} orientation="vertical" variant="middle" style={{ marginRight: theme.spacing(3) }} />

                      </>
                    : null}


                    <Tooltip
                      title={(selectedTheme === "light") ? "Make it Dark" : "Turn the Lights on"}
                      placement="bottom"
                      PopperProps={{ disablePortal: true }}
                    >
                      <IconButton onClick={() => toggleTheme()}>
                        { (selectedTheme === "light") ?
                          <Brightness4Icon /> : <Brightness5Icon />
                        }
                      </IconButton>
                    </Tooltip>

                    {(loggedIn && memberData != null) ? 
                      <Tooltip title={"Log Out"} placement="bottom" PopperProps={{ disablePortal: true }}>
                        <IconButton onClick={this.logout}>
                          <NoMeetingRoomIcon />
                        </IconButton>
                      </Tooltip>
                    :
                      <Tooltip title={"Log In"} placement="bottom" PopperProps={{ disablePortal: true }}>
                        <IconButton onClick={this.login}>
                          <MeetingRoomIcon />
                        </IconButton>
                      </Tooltip>
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
  {path: "/bgs", name: "Background-Sim", perm: "view-bgs-page"},
  {path: "/musicsync", name: "MusicSync", perm: "view-musicsync-page"}

]

export default withStyles(styles, { withTheme: true })(Layout);