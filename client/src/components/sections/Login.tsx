import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Paper, Theme, Button, Container, Slide, FormControl, FormHelperText, TextField } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { login } from "../../utils/auth"; 
import { GlobalContext } from "../../utils/contexts";

const styles = (theme: Theme) => ({
  mainContainer: {
    position: "fixed" as "fixed",
    top: 0,
    right: 0,
    left: 0,
    zIndex: theme.zIndex.tooltip,
    marginTop: theme.spacing(15)
  }, loginContainer: {
    padding: theme.spacing(4)
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
}
interface StateI {
  inputs: any;
  validation: any;
}

class Login extends Component<PropsI, StateI> {
  static contextType = GlobalContext;
  
  constructor(props: PropsI) {
    super(props);
    this.state = {
      inputs: {},
      validation: {
        password: {}
      }
    }
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    var updatedInputs = this.state.inputs;
    updatedInputs[event.target.name] = event.target.value;
    this.setState(updatedInputs);
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.context.toggleLoader(true);
    login(this.state.inputs, (res: any, authed: boolean) => {
      this.setState({
        validation: res.data
      });
      this.context.toggleLoader(false);
      if(!authed) return;
      window.location.reload();
    });
  }

  render() {
    const { classes, theme } = this.props;
    const validation = this.state.validation;

    const loginContainerActive = this.context.loginContainerActive;
    
    return (
      <Slide direction="down" in={loginContainerActive} timeout={500}>
        <Container maxWidth="sm" className={classes.mainContainer} >
            <Paper className={classes.loginContainer}>
              <Grid container direction="column" alignItems="center">
                <Grid item>
                  <Typography variant="h4" component="h4" className={classes.title}
                  >Login</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" component="h6" className={classes.subTitle}
                  >Login is required to continue</Typography>
                </Grid>
              </Grid>
              <form name="loginForm" onSubmit={this.handleSubmit} onError={this.handleSubmit}>
                <Grid container direction="column" alignItems="center">
                  <Grid item style={{marginTop: theme.spacing(2)}}>
                    <FormControl
                      error={validation.password.invalid}
                    >
                      <TextField
                        id="password"
                        placeholder="Super secret password"
                        label="Password"
                        type="password"
                        name="password"
                        required={true}
                        onChange={this.handleChange}
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
                      />
                      <FormHelperText>{validation.password.err}</FormHelperText>
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
                      onClick={() => { this.context.toggleLoginContainer(false) }}
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

export default withStyles(styles, { withTheme: true })(Login);