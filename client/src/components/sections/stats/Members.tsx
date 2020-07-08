import React, { Component } from "react";
import { withStyles, Theme, Paper, Typography, Divider, AppBar, Tabs, Tab, CircularProgress, Grid } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { StatsData } from "../../../pages/Stats";

const styles = (theme: Theme) => ({
  statTitleContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1)
  }, statSubContainer: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2)
  }, statDivider: {
    backgroundColor: theme.palette.secondary.dark,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3)
  }
});

interface Props {
  classes: Classes;
  theme: Theme;
  stats?: StatsData;
}

interface State {
  tab: number;
}

class Members extends Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      tab: 0
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.ChangeEvent<{}>, value: any) {

    this.setState({ tab: value });

  }
  
  render() {
    const { classes, theme, stats } = this.props;
    const { tab } = this.state;

    return (
      <>
        <Paper className={classes.statTitleContainer}>
          <Typography variant="h6" component="h6" align="center"
          >Members</Typography>
        </Paper>
        <AppBar position="static">
          <Tabs value={tab} onChange={this.handleChange} centered={true} variant="fullWidth" aria-label="stages tabs">
            <Tab label="Figures" />
            <Tab label="Percents" />
          </Tabs>
        </AppBar>
        <Paper className={classes.statSubContainer}>
          {
            (stats) ?
              <div>
                <Typography variant="body2" component="p" align="center" >
                Discord Members
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {stats.totalDiscordMembers}
                </Typography>
                <Divider className={classes.statDivider} variant="middle" />
                <Typography variant="body2" component="p" align="center" >
                  Tracked Members
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {(tab === 0) ? stats.totalMembers :
                    Math.floor(stats.totalMembers / (stats.totalDiscordMembers / 100)) + "%"
                  }
                </Typography>
                <Divider className={classes.statDivider} variant="middle" />
                <Typography variant="body2" component="p" align="center" >
                  Untracked Members
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {(tab === 0) ? stats.totalDiscordMembers - stats.totalMembers :
                    Math.floor((stats.totalDiscordMembers - stats.totalMembers) / (stats.totalDiscordMembers / 100)) + "%"
                  }
                </Typography>
                <Divider className={classes.statDivider} variant="middle" />
                <Typography variant="body2" component="p" align="center" >
                  Discord Bots
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {stats.totalDiscordBots}
                </Typography>
              </div>
            : 
            <Grid container direction="column" alignItems="center">
              <Grid item>
                <Typography variant="subtitle2" component="p" align="center" style={{marginBottom: theme.spacing(1)}}>
                  Loading
                </Typography>
              </Grid>
              <Grid item>
                <CircularProgress color="secondary" />
              </Grid>
            </Grid>
          }
        </Paper>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Members);