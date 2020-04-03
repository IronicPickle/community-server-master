import React, { Component } from "react";
import { Snackbar } from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';

interface PropsI {
  type: "success" | "info" | "warning" | "error" | undefined;
  message: string;
  open: boolean;
  autoHide?: boolean;
  onClose: any;
}

class Notification extends Component<PropsI> {
  type: "success" | "info" | "warning" | "error" | undefined;
  message: string | undefined;

  constructor(props: Readonly<PropsI>) {
    super(props);
    this.state = {
      type: undefined,
      message: ""
    }
  }

  render() {
    const { type, message, open, autoHide, onClose } = this.props;
    if(open) {
      this.type = type;
      this.message = message;
    }

    return (
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={open}
        autoHideDuration={(autoHide) ? 1000 : undefined}
        onClose={onClose}
      >
        <Alert elevation={6} variant="filled" onClose={onClose} severity={this.type}>
          {this.message}
        </Alert>
      </Snackbar>
    );
  }
}

export default Notification;