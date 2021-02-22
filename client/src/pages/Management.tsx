import React, { Component } from "react";
import { withStyles, Theme, Container } from "@material-ui/core";
import ManagementTable from "../components/sections/tables/members/ManagementTable";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(12),
    paddingBottom: theme.spacing(8)
  }
});

interface Props {
  classes: ClassNameMap;
}

class Management extends Component<Props> {
  render() {
    const { classes } = this.props;

    document.title = "Lykos - Management";

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