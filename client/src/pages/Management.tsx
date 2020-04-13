import React, { Component } from "react";
import { withStyles, Theme, Container } from "@material-ui/core";
import { Classes } from "jss";
import { GlobalContext } from "../utils/contexts";
import ManagementTable from "../components/sections/tables/members/ManagementTable";
import { queryMembers } from "../utils/members";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(12),
    marginBottom: theme.spacing(8)
  }
});

interface PropsI {
  classes: Classes;
  theme: Theme;
}

interface StateI {
  tableData: { [key: string]: any }[];
  presetFilters: { [key: string]: any };
}

class Management extends Component<PropsI, StateI> {
  static contextType = GlobalContext;
  
  constructor(props: Readonly<PropsI>) {
    super(props);
    this.state = {
      tableData: [],
      presetFilters: {}
    }

    this.applyFilter = this.applyFilter.bind(this);
    this.updateTable = this.updateTable.bind(this);
  }

  componentDidMount() {
    this.updateTable();
  }

  applyFilter(filter: { [key: string]: any }) {
    return (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      this.setState({presetFilters: filter});
    }
  }

  updateTable() {
    this.context.toggleLoader(true);
    queryMembers((res: { success: boolean, msg: string, data: any }) => {
      this.context.toggleLoader(false);
      if(!res.success) return;
      this.setState({ tableData: res.data });
    });
  }
  
  render() {
    const { classes } = this.props;
    const { tableData, presetFilters } = this.state;

    return (
      <div>
        <Container className={classes.mainContainer}>
          <ManagementTable data={tableData} presetFilters={presetFilters} updateTable={this.updateTable}></ManagementTable>
        </Container>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Management);