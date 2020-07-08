import React, { Component } from "react";
import { Theme, withStyles, Paper, Grid, Typography} from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginBottom: theme.spacing(1)
  }, image: {
    width: `calc(100% - ${theme.spacing(12)}px)`,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingRight: theme.spacing(6),
    paddingLeft: theme.spacing(6),
    //maskImage: "linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0))"
  }, content: {
    height: theme.spacing(37),
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    overflow: "auto"
  }
});

interface Props {
  classes: Classes;
  theme: Theme;
  imageSrc: string;
  content: any;
  reverse?: boolean;
}

class BannerBody extends Component<Props> {
  
  render() {
    const { classes, theme, imageSrc, content, reverse } = this.props;

    return (
      <>
        <Paper className={classes.mainContainer}>
          <Grid container justify="flex-start" wrap="nowrap" direction={(reverse) ? "row-reverse" : "row"}>
            <Grid item sm={4}>
              <img src={imageSrc} alt="Banner" className={classes.image} />
            </Grid>
            <Grid item sm={8}>
              <Typography
                variant="h5"
                component="div"
                className={classes.content}
                style={{
                  marginRight: (reverse) ? 0 : theme.spacing(6),
                  marginLeft: (!reverse) ? 0 : theme.spacing(6)
                }}
                align="center"
              >{content}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(BannerBody);