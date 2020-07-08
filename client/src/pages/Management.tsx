import React, { Component } from "react";
import { withStyles, Theme, Container } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import ManagementTable from "../components/sections/tables/members/ManagementTable";

const styles = (theme: Theme) => ({
  mainContainer: {
    minWidth: 1000,
    marginTop: theme.spacing(12),
    marginBottom: theme.spacing(8)
  }
});

interface Props {
  classes: Classes;
}

class Management extends Component<Props> {
  render() {
    const { classes } = this.props;

    return (
      <>
        <Container className={classes.mainContainer}>
          <ManagementTable/>
        </Container>
      </>
    );
  }
}

export default withStyles(styles)(Management);