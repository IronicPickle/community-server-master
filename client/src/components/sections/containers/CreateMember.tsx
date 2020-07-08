import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Paper, Theme, Button, Container, Slide, FormControl, FormHelperText, TextField } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../../../utils/contexts";
import HTTPMembers from "../../../http_utils/HTTPMembers";

const styles = (theme: Theme) => ({
  mainContainer: {
    position: "fixed" as "fixed",
    top: 0,
    right: 0,
    left: 0,
    zIndex: theme.zIndex.tooltip,
    padding: 0,
    marginTop: "15vh",
    maxHeight: "70vh"
  }, subContainer: {
    padding: theme.spacing(4)
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
  discordId: string;
  inaraName: string;
  inGameName: string;
}

interface InputValidation {
  discordId?: string;
  inaraName?: string;
  inGameName?: string;
}

interface Props {
  classes: Classes;
  theme: Theme;
  state: boolean;
}
interface State {
  inputs: InputData;
  validation: InputValidation;
}

class CreateMemberContainer extends Component<Props, State> {
  static contextType = GlobalContext;

  private defaultInputs = { discordId: "", inaraName: "", inGameName: "" };
  
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
    inputs[event.target.name] = event.target.value;
    this.setState({ inputs });
  }

  async onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.context.toggleLoader(true);

    const res = await HTTPMembers.create(this.state.inputs);
    this.context.toggleLoader(false);
    this.context.toggleNotification(true, {
      type: (res.success) ? "success" : "error", message: res.msg, hideDelay: 2000
    });
    if(res.errors) this.setState({ validation: res.errors });
    if(!res.success) return;
    this.context.toggleBackdrop(false, false);
    this.setState({ inputs: { ...this.defaultInputs } });
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
                  >Create Member</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" component="h6"
                  >Add a new member to the database</Typography>
                </Grid>
              </Grid>
              <form name="createMemberForm" onSubmit={this.onSubmit} onError={this.onSubmit}>
                <Grid container direction="column" alignItems="center">
                  <Grid item style={{marginTop: theme.spacing(1)}}>
                    <FormControl
                      error={!!validation.discordId}
                    >
                      <TextField
                        placeholder="18 Digit User ID"
                        label="Discord ID"
                        type="string"
                        name="discordId"
                        required={true}
                        value={inputs.discordId}
                        onChange={this.onChange}
                        InputProps={{ classes: { root: classes.colorWash } }}
                        InputLabelProps={{ classes: { shrink: classes.colorWash } }}
                        className={classes.textField}
                      />
                      <FormHelperText>{validation.discordId}</FormHelperText>
                    </FormControl>
                  </Grid>
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
                  <Grid item style={{marginTop: theme.spacing(2)}}>
                    <Button
                      type="submit"
                      color="primary"
                      size="small"
                      variant="contained"
                    >Continue</Button>
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