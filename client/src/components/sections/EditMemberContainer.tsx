import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Paper, Theme, Button, Container, Slide, FormControl, FormHelperText, TextField, Checkbox, FormControlLabel } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../../utils/contexts";
import { editMember } from "../../utils/members";

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
    width: 250
  },

  colorWash: {
    color: theme.palette.primary.contrastText + " !important",
    "&:before": {borderColor: theme.palette.secondary.main},
    "&:after": {borderColor: theme.palette.secondary.main}
  }
});

interface PropsI {
  classes: Classes;
  theme: Theme;
  state: boolean;
  data: any;
}
interface StateI {
  inputs: any;
  validation: any;
}

class EditMemberContainer extends Component<PropsI, StateI> {
  static contextType = GlobalContext;

  private defaultInputs: any = { inaraName: "", inGameName: "", joinedPrivateGroup: false };
  
  constructor(props: PropsI) {
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

  onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.context.toggleLoader(true);

    editMember(this.state.inputs._id, this.state.inputs, (res: { success: boolean, msg: string, errors: any }) => {
      this.context.toggleLoader(false);
      this.context.toggleNotification(true, {
        type: (res.success) ? "success" : "error", message: res.msg, hideDelay: 2000
      });
      this.setState({ validation: res.errors });
      if(!res.success) return;
      this.context.toggleBackdrop(false, false);
      this.setState({ inputs: { ...this.defaultInputs } });
    });
  }

  componentDidUpdate(prevProps: Readonly<PropsI> & Readonly<{ children?: React.ReactNode; }>) {
    if(this.props !== prevProps) {
      const inputs = this.props.data;
      if(Object.keys(inputs).length > 0) this.setState({ inputs });
    }
  }

  render() {
    const { classes, theme, state } = this.props;
    const { inputs, validation } = this.state;
    
    return (
      <Slide direction="down" in={state} timeout={500}>
        <Container maxWidth="sm" className={classes.mainContainer} >
          <Paper className={classes.subContainer}>
            <Grid container direction="column" alignItems="center">
              <Grid item>
                <Typography variant="h4" component="h4"
                >Edit Member</Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6" component="h6"
                >{inputs.discordId}</Typography>
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
                    error={!!validation.inaraName}
                  >
                    <FormControlLabel
                      control={<Checkbox
                        name="joinedPrivateGroup"
                        onChange={this.onChange}
                        value={inputs.joinedPrivateGroup}
                        checked={inputs.joinedPrivateGroup}
                      />}
                      label="Joined Private Group"
                    />
                    
                    <FormHelperText>{validation.inaraName}</FormHelperText>
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
    )
  }
}

export default withStyles(styles, { withTheme: true })(EditMemberContainer);