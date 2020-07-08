import { Theme, withStyles, Toolbar, Typography, Grid, TextField, Paper, IconButton, Tooltip, Divider, Switch } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { Component, ChangeEvent, KeyboardEvent } from "react";
import React from "react";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import RateReviewIcon from "@material-ui/icons/RateReview";
import { GlobalContext } from "../../../../utils/contexts";
import { Column } from "./ManagementTable";
import { DBMemberDataExtended } from "../../../../http_utils/HTTPAuth";


const styles = (theme: Theme) => ({
  createMemberButton: {
    marginRight: theme.spacing(1)
  }, searchBar: {
    width: 250
  }, divider: {
    backgroundColor: theme.palette.secondary.dark,
    height: theme.spacing(5)
  },

  colorWash: {
    color: theme.palette.primary.contrastText + " !important",
    "&:before": {borderColor: theme.palette.secondary.main},
    "&:after": {borderColor: theme.palette.secondary.main}
  }
});
  
interface Props {
  classes: Classes;
  theme: Theme;
  filteredColumn?: Column;
  stage?: 0 | 1 | 2 | 3;
  onSearchBarChange: (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onSearchBarSubmit: () => void;
  onStageChange: (stage?: 0 | 1 | 2 | 3) => () => void;
  updateTable: () => void;
}

class ManagementTitle extends Component<Props> {
  static contextType = GlobalContext;

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
    const { classes, filteredColumn, stage, onSearchBarChange, onStageChange, updateTable } = this.props;

    const searchWhitelist = [ "discordId", "discordName", "inaraName", "inGameName" ];

    const memberData: DBMemberDataExtended = this.context.memberData;

    return (
      <>
        <Paper>
          <Toolbar>
            <Grid container justify="flex-start">
              <Grid item>
                <Toolbar style={{padding: 0}}>
                  <Typography
                    variant="h6"
                    component="h6"
                  >Squadron Management</Typography>
                </Toolbar>
              </Grid>
            </Grid>
            <Grid container justify="center">
              <Grid item>
                <Toolbar style={{padding: 0}}>
                  <Divider className={classes.divider} orientation="vertical" variant="middle" />

                  <IconButton onClick={onStageChange(0)} color="secondary" disabled={stage === 0}>
                    <Tooltip title="Filter: Not Started" aria-label="filter not started">
                      <ClearIcon color="secondary"/>
                    </Tooltip>
                  </IconButton>
                  <IconButton onClick={onStageChange(1)} color="secondary" disabled={stage === 1}>
                    <Tooltip title="Filter: In Progress" aria-label="filter in progress">
                      <HourglassEmptyIcon color="secondary"/>
                    </Tooltip>
                  </IconButton>
                  <IconButton onClick={onStageChange(2)} color="secondary" disabled={stage === 2}>
                    <Tooltip title="Filter: Reviewed" aria-label="filter reviewed">
                      <RateReviewIcon color="secondary"/>
                    </Tooltip>
                  </IconButton>
                  <IconButton onClick={onStageChange(3)} color="secondary" disabled={stage === 3}>
                    <Tooltip title="Filter: Completed" aria-label="filter completed">
                      <CheckIcon color="secondary"/>
                    </Tooltip>
                  </IconButton>

                  <Switch color="secondary"
                    disabled={typeof stage === "undefined"}
                    checked={typeof stage !== "undefined"}
                    onChange={onStageChange()}
                    name="checkedA"
                  />

                  <Divider className={classes.divider} orientation="vertical" variant="middle" />
                </Toolbar>
              </Grid>
            </Grid>
            <Grid container justify="flex-end">
              <Grid item>
                <Toolbar style={{padding: 0}}>
                  {
                    (memberData.webPerms["create-member"]) ?
                      <IconButton
                        color="secondary"
                        aria-label="create member"
                        onClick={() => { this.context.toggleContainer("createMember", true, () => { updateTable(); }) }}
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
                    InputProps={{
                      classes: {
                        root: classes.colorWash
                      }
                    }}
                    InputLabelProps={{
                      classes: {
                        shrink: classes.colorWash
                      }
                    }}
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