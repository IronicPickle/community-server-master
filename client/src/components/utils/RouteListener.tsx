import { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import React from "react";
import { Location } from "history";

interface RouteListenerPropsI {
  handleRouteChange: Function;
}

type RouteListenerProps = RouteListenerPropsI & RouteComponentProps;
class RouteListener extends Component<RouteListenerProps> {
  unlisten: Function;

  constructor(props: RouteListenerProps) {
    super(props)

    this.unlisten = () => {};
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen((location: Location) => {
      this.props.handleRouteChange(location.pathname);
    });
  }
  componentWillUnmount() {
    this.unlisten();
  }
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default withRouter(RouteListener);