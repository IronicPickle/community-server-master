import React, { Component } from "react";
import { Theme, Typography, withStyles, Paper, Toolbar, Grid, IconButton, Tooltip } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import LinkIcon from "@material-ui/icons/Link";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginBottom: theme.spacing(1)
  }
});

interface Props {
  classes: Classes;
  content: string;
  reverse?: boolean;
  link?: string;
}

class BannerTitle extends Component<Props> {
  render() {
    const { classes, content, reverse, link } = this.props;

    return (
      <>
        <Paper className={classes.mainContainer}>
          <Toolbar>
            <Grid container justify="space-between" direction={(reverse) ? "row-reverse" : "row"}>
              <Grid item>
                <Toolbar style={{padding: 0}}>
                  <Typography
                    variant="h6"
                    component="h6"
                  >{content}</Typography>
                </Toolbar>
              </Grid>
              <Grid item>
                {
                  (link) ?
                    <Toolbar style={{padding: 0}}>
                      <IconButton onClick={() => {window.location.replace(link)}} color="secondary">
                        <Tooltip title="Open" aria-label="open">
                          <LinkIcon color="secondary"/>
                        </Tooltip>
                      </IconButton>
                    </Toolbar>
                  : null
                }
              </Grid>
            </Grid>
          </Toolbar>
        </Paper>
      </>
    );
  }
}

export default withStyles(styles)(BannerTitle);