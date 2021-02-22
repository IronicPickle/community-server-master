import React, { Component } from "react";
import { withStyles, Theme, Container, Typography } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import IndexTitle from "../components/sections/index/IndexTitle";
import IndexNewsList from "../components/sections/index/IndexNewsList";
import IndexServerList from "../components/sections/index/IndexServerList";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(12),
    paddingBottom: theme.spacing(8),
    maxWidth: theme.spacing(200)
  }
});

interface Props {
  classes: ClassNameMap;
}

class Index extends Component<Props> {  

  render() {
    const { classes } = this.props;

    document.title = "Lykos - Home"

    return (
      <>
        <Container className={classes.mainContainer}>
          <Typography
            variant="h5"
            component="div"
          >
            <IndexTitle/>
            <IndexServerList/>
            <IndexNewsList/>
          </Typography>
        </Container>
      </>
    );
  }
}

export default withStyles(styles)(Index);