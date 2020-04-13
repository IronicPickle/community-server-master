import React, { Component, SyntheticEvent } from "react";
import { Snackbar, SnackbarCloseReason } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

interface PropsI {
  state: boolean;
  data: {
    type: "success" | "info" | "warning" | "error" | undefined,
    message: string,
    hideDelay?: number,
  };
  onClose: (event: SyntheticEvent, reason: SnackbarCloseReason) => void;
}

class NotificationContainer extends Component<PropsI> {

  render() {
    const { state, data, onClose } = this.props;
    const { type, message, hideDelay } = data;

    return (
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={state}
        autoHideDuration={hideDelay}
        onClose={onClose}
      >
        <Alert elevation={6} variant="filled" severity={type}>
          {message}
        </Alert>
      </Snackbar>
    );
  }
}

export default NotificationContainer;