/**
 * Created by zhoupenghui on 2018/12/25.
 */
import React from "react";
import ReactDOM from "react-dom";

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.click = this.click.bind();
  }

  componentWillMount() {
	  console.log("Root componentWillMount");
  }

	click () {
		console.log("8888888888");
	}

  render() {
    return (
      <div onClick={this.click}>这是入口文件完美实时预览，现在修改文件保存了，验证一下+++</div>
    );
  }
}

ReactDOM.render(<Root />, document.getElementById("root"));


