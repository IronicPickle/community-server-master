import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Paper, Theme, Button, Container, Slide, FormControl, FormHelperText, TextField, Toolbar, Avatar } from "@material-ui/core";
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
    overflow: "auto"
  }, subContainer: {
    padding: theme.spacing(4)
  }, subTitle: {
    maxWidth: theme.spacing(48),
    overflow: "hidden" as "hidden",
    whiteSpace: "nowrap" as "nowrap"
  }, textField: {
    width: 350
  },

  colorWash: {
    color: theme.palette.primary.contrastText + " !important",
    "&:before": {borderColor: theme.palette.secondary.main},
    "&:after": {borderColor: theme.palette.secondary.main}
  }
});

interface InputData {
  [key: string]: any;
  message: string;
}

interface InputValidation {
  message?: string;
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

class RequestMemberContainer extends Component<Props, State> {
  static contextType = GlobalContext;

  private defaultInputs = { message: "" };
  
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
    const inputs = { ...this.state.inputs };
    
    if(!this.props.data) return null;
    const res = await HTTPMembers.createRevisionRequest(this.props.data._id, this.context.memberData.discordId, inputs);

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
                  >Request Revision</Typography>
                </Grid>
                <Grid item>
                  <Toolbar className={classes.subTitle}>
                    <Typography variant="h6" component="h6"
                    >Requesting from </Typography>
                    <Avatar alt={data.discordName} src={data.discordAvatar} style={{ margin: theme.spacing(1) }}
                    >{(data.discordName + "").charAt(0).toUpperCase()}</Avatar>
                    <Typography variant="h6" component="h6"
                    >{data.discordName}</Typography>
                  </Toolbar>
                </Grid>
              </Grid>
              <form name="loginForm" onSubmit={this.onSubmit} onError={this.onSubmit}>
                <Grid container direction="column" alignItems="center">
                  <Grid item style={{marginTop: theme.spacing(2)}}>
                    <FormControl
                      error={!!validation.message}
                    >
                      <TextField
                        placeholder="This message will be sent to the user"
                        label="Message"
                        type="string"
                        name="message"
                        required={true}
                        multiline={true}
                        value={inputs.message}
                        onChange={this.onChange}
                        InputProps={{ classes: { root: classes.colorWash } }}
                        InputLabelProps={{ classes: { shrink: classes.colorWash } }}
                        className={classes.textField}
                      />
                      <FormHelperText>{validation.message}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item style={{marginTop: theme.spacing(2)}}>
                    <Button
                      type="submit"
                      color="primary"
                      size="small"
                      variant="contained"
                    >Send</Button>
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

export default withStyles(styles, { withTheme: true })(RequestMemberContainer);