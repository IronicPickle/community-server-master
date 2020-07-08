import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Paper, Theme, Button, Container, Slide, FormControl, FormHelperText, TextField, Toolbar, IconButton, Tooltip } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../../../utils/contexts";
import HTTPMissions from "../../../http_utils/HTTPMissions";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";

const styles = (theme: Theme) => ({
  mainContainer: {
    position: "fixed" as "fixed",
    top: 0,
    right: 0,
    left: 0,
    zIndex: theme.zIndex.tooltip,
    padding: 0,
    marginTop: "15vh",
    maxHeight: "70vh",
    overflow: "auto"
  }, subContainer: {
    padding: theme.spacing(4)
  }, textField: {
    width: 400
  }, icon: {
    marginLeft: theme.spacing(1)
  },

  colorWash: {
    color: `${theme.palette.primary.contrastText} !important`,
    borderColor: `${theme.palette.secondary.dark} !important`,
    "&:before": {borderColor: theme.palette.secondary.main},
    "&:after": {borderColor: theme.palette.secondary.main}
  }
});

interface InputData {
  [key: string]: any;
  description: string;
  objectives: string[];
}

interface InputValidation {
  description?: string;
  objectives: string[];
}

interface Props {
  classes: Classes;
  theme: Theme;
  state: boolean;
}
interface State {
  inputs: InputData
  validation: InputValidation;
}

class CreateMemberContainer extends Component<Props, State> {
  static contextType = GlobalContext;

  private defaultInputs: any = { description: "", objectives: [ "" ] };
  
  constructor(props: Props) {
    super(props);
    this.state = {
      inputs: { ...JSON.parse(JSON.stringify(this.defaultInputs)) },
      validation: { objectives: [ "" ] }
    }
    
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.onObjectiveAdd = this.onObjectiveAdd.bind(this);
    this.onObjectiveRemove = this.onObjectiveRemove.bind(this);
  }

  onDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const inputs = this.state.inputs;
    inputs.description = event.target.value;
    this.setState({ inputs });
  }

  onObjectivesChange(index: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputs = this.state.inputs;
      inputs.objectives[index] = event.target.value;
      this.setState({ inputs });
    }
  }

  onObjectiveAdd() {
    const inputs = this.state.inputs;
    inputs.objectives.push("");
    this.setState({ inputs });
  }

  onObjectiveRemove(index: number) {
    return () => {
      const inputs = this.state.inputs;
      if(inputs.objectives.length === 1) return;
      inputs.objectives.splice(index, 1);
      this.setState({ inputs });
    }
  }

  async onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    this.context.toggleLoader(true);

    const res = await HTTPMissions.broadcast(this.context.memberData.discordId, this.state.inputs);
    this.context.toggleLoader(false);
    this.context.toggleNotification(true, {
      type: (res.success) ? "success" : "error", message: res.msg, hideDelay: 2000
    });
    if(res.errors) this.setState({ validation: res.errors });
    if(!res.success) return;
    this.context.toggleBackdrop(false, false);
    this.setState({ inputs: { ...JSON.parse(JSON.stringify(this.defaultInputs)) } });
  }

  render() {
    const { classes, theme, state } = this.props;
    const { inputs, validation } = this.state;
    
    return (
      <>
        <Slide direction="down" in={state} timeout={500}>
          <Container maxWidth="sm" className={classes.mainContainer} >
            <Paper className={classes.subContainer}>
              <Grid container direction="column" alignItems="center">
                <Grid item>
                  <Typography variant="h4" component="h4"
                  >Create Mission</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" component="h6"
                  >Create and broadcast a new mission</Typography>
                </Grid>
              </Grid>
              <form name="createMissionForm" onSubmit={this.onSubmit} onError={this.onSubmit}>
                <Grid container direction="column" alignItems="center">
                  <Grid item style={{ marginTop: theme.spacing(1) }}>
                    <FormControl
                      error={!!validation.description}
                    >
                      <TextField
                        placeholder="A summary of the mission"
                        label="Description"
                        type="string"
                        name="description"
                        required={true}
                        multiline={true}
                        value={inputs.description}
                        onChange={this.onDescriptionChange}
                        InputProps={{ classes: { root: classes.colorWash } }}
                        InputLabelProps={{ classes: { shrink: classes.colorWash } }}
                        className={classes.textField}
                      />
                      <FormHelperText>{validation.description}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <Toolbar style={{ marginTop: theme.spacing(1) }}>
                      <Typography
                        variant="body1"
                        component="p"
                      >Objectives</Typography>
                      <IconButton onClick={this.onObjectiveAdd} color="secondary" className={classes.icon}>
                        <Tooltip title="Add Objective" aria-label="add objective">
                          <AddCircleOutlineIcon color="secondary"/>
                        </Tooltip>
                      </IconButton>
                    </Toolbar>
                  </Grid>
                  {
                    inputs.objectives.map((objective: string, i: number) => {
                      return (
                        <Grid item style={{ marginTop: theme.spacing(1) }} key={`objective-${i}`}>
                          <Grid container justify="space-between">
                            <Toolbar style={{padding: 0, minHeight: 0}}>
                              <FormControl
                                error={!!validation.objectives[i]}
                              >
                                <TextField
                                  placeholder="A description of the objective"
                                  label={`Objective ${i + 1}`}
                                  type="string"
                                  name={`objective-${i}`}
                                  required={true}
                                  value={objective}
                                  onChange={this.onObjectivesChange(i)}
                                  InputProps={{ classes: { root: classes.colorWash, notchedOutline: classes.colorWash } }}
                                  InputLabelProps={{ classes: { shrink: classes.colorWash } }}
                                  className={classes.textField}
                                  variant="outlined"
                                />
                                <FormHelperText>{validation.objectives[i]}</FormHelperText>
                              </FormControl>
                                {
                                  (inputs.objectives.length > 1) ?
                                    <IconButton onClick={this.onObjectiveRemove(i)} color="secondary" className={classes.icon}>
                                      <Tooltip title="Remove Objective" aria-label="remove objective">
                                        <RemoveCircleOutlineIcon color="secondary"/>
                                      </Tooltip>
                                    </IconButton>
                                  : null
                                }
                            </Toolbar>
                          </Grid>
                        </Grid>
                      )
                    })
                  }
                  <Grid item style={{marginTop: theme.spacing(2)}}>
                    <Button
                      type="submit"
                      color="primary"
                      size="small"
                      variant="contained"
                    >Broadcast</Button>
                    <Button
                      type="button"
                      color="primary"
                      size="small"
                      variant="contained"
                      onClick={() => { this.context.toggleBackdrop(false, true) }}
                      style={{marginLeft: theme.spacing(2)}}
                    >Cancel</Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Container>
        </Slide>
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(CreateMemberContainer);