import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Paper, Theme, Button, Container, Slide, FormControl, FormHelperText, TextField, Checkbox, FormControlLabel, Toolbar, Avatar } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../../../utils/contexts";
import HTTPMembers, { DBMemberData } from "../../../http_utils/HTTPMembers";

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
    minWidth: 500
  }, subContainer: {
    padding: theme.spacing(4)
  }, subTitle: {
    maxWidth: theme.spacing(48),
    overflow: "hidden" as "hidden",
    whiteSpace: "nowrap" as "nowrap"
  }, textField: {
    width: 250
  },

  colorWash: {
    color: theme.palette.primary.contrastText + " !important",
    "&:before": {borderColor: theme.palette.secondary.main},
    "&:after": {borderColor: theme.palette.secondary.main}
  }
});

interface InputData {
  [key: string]: any;
  inaraName: string;
  inGameName: string;
  joinedSquadron: boolean;
  joinedInaraSquadron: boolean;
}

interface InputValidation {
  inaraName?: string;
  inGameName?: string;
  joinedSquadron?: string;
  joinedInaraSquadron?: string;
}

interface Props {
  classes: Classes;
  theme: Theme;
  state: boolean;
  data?: DBMemberData;
}

interface State {
  inputs: InputData;
  validation: InputValidation;
}

class EditMemberContainer extends Component<Props, State> {
  static contextType = GlobalContext;

  private defaultInputs = { inaraName: "", inGameName: "", joinedSquadron: false, joinedInaraSquadron: false };
  
  constructor(props: Props) {
    super(props);
    this.state = {
      inputs: { ...this.defaultInputs },
      validation: {}
    }
    
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const inputs = this.state.inputs;
    let input: string | boolean = event.target.value;
    if(input === "false") { input = true; } else if(input === "true") { input = false; }
    inputs[event.target.name] = input;
    this.setState({ inputs });
  }

  async onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.context.toggleLoader(true);
    const res = await HTTPMembers.edit(this.state.inputs._id, this.context.memberData.discordId, this.state.inputs);
    this.context.toggleLoader(false);
    this.context.toggleNotification(true, {
      type: (res.success) ? "success" : "error", message: res.msg, hideDelay: 2000
    });
    if(res.errors) this.setState({ validation: res.errors });
    if(!res.success) return;
    this.context.toggleBackdrop(false, false);
    this.setState({ inputs: { ...this.defaultInputs } });
  }

  componentDidUpdate(prevProps: Readonly<Props> & Readonly<{ children?: React.ReactNode; }>) {
    if(this.props !== prevProps) {
      const inputs = this.props.data;
      if(!inputs) return;
      if(Object.keys(inputs).length > 0) this.setState({ inputs });
    }
  }

  render() {
    const { classes, theme, state, data } = this.props;
    const { inputs, validation } = this.state;

    if(!data) return null;
    
    return (
      <>
        <Slide direction="down" in={state} timeout={500}>
          <Container maxWidth="sm" className={classes.mainContainer} >
            <Paper className={classes.subContainer}>
              <Grid container direction="column" alignItems="center">
                <Grid item>
                  <Typography variant="h4" component="h4"
                  >Edit Member</Typography>
                </Grid>
                <Grid item>
                  <Toolbar className={classes.subTitle}>
                    <Typography variant="h6" component="h6"
                    >Editing </Typography>
                    <Avatar alt={data.discordName} src={data.discordAvatar} style={{ margin: theme.spacing(1) }}
                    >{(data.discordName + "").charAt(0).toUpperCase()}</Avatar>
                    <Typography variant="h6" component="p"
                    >{data.discordName}</Typography>
                  </Toolbar>
                </Grid>
              </Grid>
              <form name="createMemberForm" onSubmit={this.onSubmit} onError={this.onSubmit}>
                <Grid container direction="column" alignItems="center">
                  <Grid item style={{marginTop: theme.spacing(1)}}>
                    <FormControl
                      error={!!validation.inaraName}
                    >
                      <TextField
                        placeholder="Name on Inara.cz"
                        label="Inara Name"
                        type="string"
                        name="inaraName"
                        required={false}
                        value={inputs.inaraName}
                        onChange={this.onChange}
                        InputProps={{ classes: { root: classes.colorWash } }}
                        InputLabelProps={{ classes: { shrink: classes.colorWash } }}
                        className={classes.textField}
                      />
                      <FormHelperText>{validation.inaraName}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item style={{marginTop: theme.spacing(1)}}>
                    <FormControl
                      error={!!validation.inGameName}
                    >
                      <TextField
                        placeholder="Name In-Game"
                        label="In-Game Name"
                        type="string"
                        name="inGameName"
                        required={false}
                        onChange={this.onChange}
                        value={inputs.inGameName}
                        InputProps={{ classes: { root: classes.colorWash } }}
                        InputLabelProps={{ classes: { shrink: classes.colorWash } }}
                        className={classes.textField}
                      />
                      <FormHelperText>{validation.inGameName}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item style={{marginTop: theme.spacing(1)}}>
                    <FormControl
                      error={!!validation.joinedSquadron}
                    >
                      <FormControlLabel
                        control={<Checkbox
                          name="joinedSquadron"
                          onChange={this.onChange}
                          value={inputs.joinedSquadron}
                          checked={inputs.joinedSquadron}
                        />}
                        label="Joined Squadron"
                      />
                      
                      <FormHelperText>{validation.joinedSquadron}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item style={{marginTop: theme.spacing(1)}}>
                    <FormControl
                      error={!!validation.joinedInaraSquadron}
                    >
                      <FormControlLabel
                        control={<Checkbox
                          name="joinedInaraSquadron"
                          onChange={this.onChange}
                          value={inputs.joinedInaraSquadron}
                          checked={inputs.joinedInaraSquadron}
                        />}
                        label="Joined Inara Squadron"
                      />
                      
                      <FormHelperText>{validation.joinedInaraSquadron}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item style={{marginTop: theme.spacing(2)}}>
                    <Button
                      type="submit"
                      color="primary"
                      size="small"
                      variant="contained"
                    >Save</Button>
                    <Button
                      type="button"
                      color="primary"
                      size="small"
                      variant="contained"
                      onClick={() => { this.context.toggleBackdrop(false, true); }}
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

export default withStyles(styles, { withTheme: true })(EditMemberContainer);