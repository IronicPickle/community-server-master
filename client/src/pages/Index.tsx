import React, { Component } from "react";
import { withStyles, Theme, Container, Grid, Tooltip } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../utils/contexts";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(16),
    padding: 0,
    maxWidth: "80%"
  }, socialIconContainer: {
    width: "75%"
  }, socialIcon: {
    width: "100%"
  }
});

interface IndexPropsI {
  classes: Classes;
  theme: Theme;
}

interface IndexStateI {

}

class Index extends Component<IndexPropsI, IndexStateI> {
  static contextType = GlobalContext;
  
  constructor(props: Readonly<IndexPropsI>) {
    super(props);
    this.state = {

    }
  }
  
  render() {
    const { classes } = this.props;
    return (
      <Container className={classes.mainContainer}>
        <Grid container direction="row" alignItems="center" justify="center">
          <Grid item>
            <Grid container justify="center">
              <Grid item className={classes.socialIconContainer}>
                <a href="ts3server://ts.lykosgc.uk?name=%29%3A%20%28%3A">
                  <Tooltip title="Join Teamspeak Server" placement="top">
                    <img src="/images/teamspeak.png" alt="" className={classes.socialIcon}/>
                  </Tooltip>
                </a>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container justify="center">
              <Grid item className={classes.socialIconContainer}>
                <a href="https://discordapp.com/invite/xXrJ3mu" target="_blank" rel="noopener noreferrer">
                  <Tooltip title="Join Discord Server" placement="top">
                    <img src="/images/discord.png" alt="" className={classes.socialIcon}/>
                  </Tooltip>
                </a>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Index);