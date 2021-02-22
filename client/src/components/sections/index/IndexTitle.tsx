import React, { Component } from "react";
import { withStyles, Theme, Paper, Grid, Typography, Toolbar, Divider, Box } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import { globalContext, GlobalContext } from "../../../utils/contexts";

const styles = (theme: Theme) => ({
  mainContainer: {
    width: "55%",
    minWidth: theme.spacing(96),

    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  }, image: {
    width: "100%"
  },
  boxContainer: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6)
  },
  socialsContainer: {
    padding: theme.spacing(2),
    minHeight: "100%"
  },
  socialContainer: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.main
    },
    minWidth: "100%"
  },
  socialToolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  socialLogo: {
    height: theme.spacing(8),
    marginRight: theme.spacing(4)
  }
});

interface Props {
  classes: ClassNameMap;
}

class IndexTitle extends Component<Props> {
  static contextType = globalContext;

  render() {
    const { classes } = this.props;
    const { selectedTheme } = this.context as GlobalContext;

    const logoTheme = (selectedTheme == "light") ? "dark" : "light";
    const logo = `/images/banner_${logoTheme}.png`;

    return (
      <>
        <Box display="flex" justifyContent="center">
          <Paper className={classes.mainContainer} elevation={24}>
            <Box display="flex">
              <Box className={classes.boxContainer}>
                <Grid container direction="column" justify="center" style={{ height: "100%" }}>
                  <div>
                    <Typography
                      variant="h2"
                      component="h1"
                      align="center"
                      noWrap
                    >
                      Welcome to
                    </Typography>
                    <img src={logo} alt="Lykos Banner" className={classes.image} />
                  </div>
                </Grid>
              </Box>
              <Box>
                <Divider orientation="vertical" />
              </Box>
              <Box className={classes.boxContainer}>
                <Grid container
                  justify="center"
                  direction="column"
                  spacing={2}
                  className={classes.socialsContainer}
                >
                  <Grid item xs={4} className={classes.socialContainer}>
                    <a href="https://discord.lykos.uk/" target="_blank" rel="noopener noreferrer">
                      <Toolbar disableGutters className={classes.socialToolbar}>
                        <img src="/images/discord.svg" alt="Discord Logo" className={classes.socialLogo} />
                        Discord
                      </Toolbar>
                    </a>
                  </Grid>
                  <Grid item xs={4} className={classes.socialContainer}>
                    <a href="https://ts.lykos.uk/" target="_blank" rel="noopener noreferrer">
                      <Toolbar disableGutters className={classes.socialToolbar}>
                        <img src="/images/teamspeak.svg" alt="TeamSpeak Logo" className={classes.socialLogo} />
                        <span>TeamSpeak</span>
                      </Toolbar>
                    </a>
                  </Grid>
                  <Grid item xs={4} className={classes.socialContainer}>
                    <a href="https://steam.lykos.uk/" target="_blank" rel="noopener noreferrer">
                      <Toolbar disableGutters className={classes.socialToolbar}>
                        <img src="/images/steam.svg" alt="Steam Logo" className={classes.socialLogo} />
                        Steam
                      </Toolbar>
                    </a>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Box>
      </>
    );
  }
}

export default withStyles(styles)(IndexTitle);