import React, { Component } from "react";
import { Box } from "@material-ui/core";

type PropsI = {
  onClick: any
}

class Cover extends Component<PropsI> {  
  render() {
    return (
      <Box
        style={{
          backgroundColor: "black",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          opacity: 0.4
        }}
        position="fixed"
        zIndex="modal"
        onClick={this.props.onClick}
      />
    );
  }
}

export default Cover;