import React, { Component } from "react";
import { withStyles, Theme, Container, Grid, Paper, Typography, Toolbar, IconButton, Tooltip } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../utils/contexts";
import StatsStages from "../components/sections/stats/Members";
import StatsOther from "../components/sections/stats/Applications";
import RefreshIcon from "@material-ui/icons/Refresh";

const styles = (theme: Theme) => ({
  mainContainer: {
    minWidth: 800,
    marginTop: theme.spacing(12),
    marginBottom: theme.spacing(8)
  },

  statsContainer: {
    marginTop: theme.spacing(2)
  }, statContainer: {
    width: "40%"
  }
});

export interface StatsData {
  totalMembers: number;
  totalMembers0: number;
  totalMembers1: number;
  totalMembers2: number;
  totalMembers3: number;
  totalRevisions: number;
  totalDiscordBots: number;
  totalDiscordMembers: number;
}

interface Props {
  classes: Classes;
  theme: Theme;
}

interface State {
  stats?: StatsData;
}

class Stats extends Component<Props, State> {
  static contextType = GlobalContext;
  
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      stats: undefined
    }

    this.updateStats = this.updateStats.bind(this);
  }

  componentDidMount() {
    this.updateStats();
  }

  async updateStats() {
    /*this.context.toggleLoader(true);
    const res = await HTTPMembers.queryStats();
    this.context.toggleLoader(false);
    if(!res.success) return;
    this.setState({ stats: res.data });*/
  }
  
  render() {
    const { classes } = this.props;
    const { stats } = this.state;

    return (
      <>
        <Container className={classes.mainContainer}>
          <Paper>
            <Toolbar>
              <Grid container justify="flex-start">
                <Grid item>
                  <Typography
                    variant="h6"
                    component="h6"
                    align="center"
                  >Statistics</Typography>
                </Grid>
              </Grid>
              <Grid container justify="flex-end">
                <Grid item>
                  <IconButton onClick={this.updateStats} color="secondary">
                    <Tooltip title="Refresh" aria-label="refresh">
                      <RefreshIcon color="secondary"/>
                    </Tooltip>
                  </IconButton>
                </Grid>
              </Grid>
            </Toolbar>
          </Paper>
          <Container className={classes.statsContainer}>
            <Grid container justify="space-evenly">
              <Grid item className={classes.statContainer}>
                <StatsStages stats={stats} />
              </Grid>
              <Grid item className={classes.statContainer}>
                <StatsOther stats={stats} />
              </Grid>
            </Grid>
          </Container>
        </Container>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Stats);