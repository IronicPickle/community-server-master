import React, { Component } from "react";
import { withStyles, Theme, Container, Grid, Paper, Typography } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../utils/contexts";
import { queryStats } from "../utils/members";
import StatsStages from "../components/sections/stats/StatsStages";
import StatsOther from "../components/sections/stats/StatsOther";

const styles = (theme: Theme) => ({
  titleContainer: {
    marginTop: theme.spacing(12)
  }, title: {
    padding: theme.spacing(2)
  }, statsContainer: {
    marginTop: theme.spacing(2)
  }, statContainer: {
    width: "28%"
  }
});

interface PropsI {
  classes: Classes;
  theme: Theme;
}

interface StateI {
  stats: any;
}

class Index extends Component<PropsI, StateI> {
  static contextType = GlobalContext;
  
  constructor(props: Readonly<PropsI>) {
    super(props);
    this.state = {
      stats: {}
    }

    this.updateStats = this.updateStats.bind(this);
  }

  componentDidMount() {
    this.updateStats();
  }

  updateStats() {
    this.context.toggleLoader(true);
    queryStats((res: { success: boolean, msg: string, data: any }) => {
      this.context.toggleLoader(false);
      if(!res.success) return;
      this.setState({ stats: res.data });
    });
  }
  
  render() {
    const { classes } = this.props;
    const { stats } = this.state;

    console.log(stats)

    return (
      <div>
        <Container className={classes.titleContainer}>
          <Paper>
            <Typography
              variant="h6"
              component="h6"
              align="center"
              className={classes.title}
            >IP3X Squadron Portal</Typography>
          </Paper>
        </Container>
        <Container className={classes.statsContainer}>
          <Grid container justify="space-evenly">
            <Grid item className={classes.statContainer}>
              <StatsStages stats={stats} />
            </Grid>
            <Grid item className={classes.statContainer}>
              <StatsOther stats={stats} />
            </Grid>
            <Grid item className={classes.statContainer}>
              <Paper className={classes.statSubContainer}>
                <Typography
                  variant="subtitle1"
                  component="h6"
                  align="center"
                >IP3X Squadron Portal</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Index);