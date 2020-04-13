import React, { Component } from "react";
import { withStyles, Theme, Paper, Typography, Divider, AppBar, Tabs, Tab, CircularProgress, Grid } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";

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

interface PropsI {
  classes: Classes;
  theme: Theme;
  stats: any;
}

interface StatsI {
  tab: number;
}

class StatsStages extends Component<PropsI, StatsI> {
  constructor(props: Readonly<PropsI>) {
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
      <div>
        <Paper className={classes.statTitleContainer}>
          <Typography variant="h6" component="h6" align="center"
          >Applications</Typography>
        </Paper>
        <AppBar position="static">
          <Tabs value={tab} onChange={this.handleChange} centered={true} variant="fullWidth" aria-label="stages tabs">
            <Tab label="Figures" />
            <Tab label="Percents" />
          </Tabs>
        </AppBar>
        <Paper className={classes.statSubContainer}>
          {
            (Object.keys(stats).length > 0) ?
              <div>
                <Typography variant="body2" component="p" align="center" >
                  Total Members
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {stats.total}
                </Typography>
                <Divider className={classes.statDivider} variant="middle" />
                <Typography variant="body2" component="p" align="center" >
                  Idle Members
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {(tab === 0) ?
                      stats.total0
                    :
                    Math.floor(stats.total0 / (stats.total / 100)) + "%"
                  }
                </Typography>
                <Divider className={classes.statDivider} variant="middle" />
                <Typography variant="body2" component="p" align="center" >
                  Ongoing Applications
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {(tab === 0) ?
                      stats.total1
                    :
                    Math.floor(stats.total1 / (stats.total / 100)) + "%"
                  }
                </Typography>
                <Divider className={classes.statDivider} variant="middle" />
                <Typography variant="body2" component="p" align="center" >
                  Completed Applications
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                {(tab === 0) ?
                      stats.total2
                    :
                      Math.floor(stats.total2 / (stats.total / 100)) + "%"
                  }
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
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(StatsStages);