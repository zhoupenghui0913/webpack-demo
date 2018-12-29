/**
 * Created by zhoupenghui on 2018/12/25.
 */
import React from "react";
import ReactDOM from "react-dom";

class Root extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>这是入口文件完美实时预览，现在修改文件保存了++++++</div>
    );
  }
}

ReactDOM.render(<Root />, document.getElementById("root"));


