import { Theme, withStyles, Toolbar, Typography, Grid, TextField, Paper, IconButton, Tooltip, Divider} from "@material-ui/core";
import { Component, ChangeEvent, KeyboardEvent } from "react";
import React from "react";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { globalContext } from "../../../../utils/contexts";
import { Column } from "./ManagementTable";
import { DBMemberDataExtended } from "../../../../http_utils/HTTPAuth";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import ListIcon from '@material-ui/icons/List';


const styles = (theme: Theme) => ({
  titleContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  titleIcon: {
    width: theme.spacing(6),
    height: theme.spacing(6)
  },
  title: {
    marginLeft: theme.spacing(4)
  },
  createMemberButton: {
    marginRight: theme.spacing(1)
  }, searchBar: {
    width: 250
  }, divider: {
    backgroundColor: theme.palette.secondary.dark,
    height: theme.spacing(5)
  }
});
  
interface Props {
  classes: ClassNameMap;
  theme: Theme;
  filteredColumn?: Column;
  onSearchBarChange: (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onSearchBarSubmit: () => void;
  openCreateMember: () => void;
}

class ManagementTitle extends Component<Props> {
  static contextType = globalContext;

  constructor(props: Props) {
    super(props);

    this.onSearchKeyDown = this.onSearchKeyDown.bind(this);
  }

  onSearchKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if(event.keyCode === 13) {
      this.props.onSearchBarSubmit();
    }
  }

  render() {
    const { classes, filteredColumn, onSearchBarChange, openCreateMember } = this.props;

    const searchWhitelist = [ "discordId", "discordName", "inaraName", "inGameName" ];

    const memberData: DBMemberDataExtended = this.context.memberData;

    return (
      <>
        <Paper>
          <Toolbar>
            <Toolbar className={classes.titleContainer}>
              <Grid container justify="flex-start">
                <Toolbar style={{ padding: 0 }}>
                  <ListIcon className={classes.titleIcon}/>
                </Toolbar>
              </Grid>
              <Grid container justify="center" className={classes.title}>
                <Toolbar style={{ padding: 0 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    noWrap
                  >User Management</Typography>
                </Toolbar>
              </Grid>
              <Grid container justify="flex-end" />
            </Toolbar>
            <Grid container justify="flex-end">
              <Grid item>
                <Toolbar style={{padding: 0}}>
                  {
                    (memberData.webPerms["create-member"]) ?
                      <IconButton
                        color="secondary"
                        aria-label="create member"
                        onClick={() => openCreateMember()}
                        className={classes.createMemberButton}
                      >
                        <Tooltip title="Create Member" aria-label="create member">
                          <AddCircleOutlineIcon />
                        </Tooltip>
                      </IconButton>
                    : null
                  }
                  <TextField
                    id="search"
                    label="Search"
                    type="string"
                    variant="filled"
                    placeholder={(filteredColumn) ? filteredColumn.title : "N/A"}
                    onChange={onSearchBarChange}
                    onKeyDown={this.onSearchKeyDown}
                    className={classes.searchBar}
                    disabled={!searchWhitelist.includes((filteredColumn) ? filteredColumn.name : "N/A")}
                  />
                </Toolbar>
              </Grid>
            </Grid>
          </Toolbar>
        </Paper>
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ManagementTitle);