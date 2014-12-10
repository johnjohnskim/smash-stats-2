function isNum(x) {
  return !isNaN(x);
}
function isPct(x) {
  return x.substring(x.length - 1) == '%';
}
function isDate(x) {
  return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(x);
}

var Table = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      // search text
      filter: '',
      // column position to order by
      sortBy: null,
      // asc (+) vs desc (-) order
      order: '+'
    };
  },
  componentDidMount: function() {
    $.getJSON(this.props.url, {}, function(data) {
      if (!data || !data.length) return;
      // Make sure percentages are properly formatted
      if (_.has(data[0], 'winpct')) {
        data.forEach(function(d) {
          d.winpct = Math.round(d.winpct * 100) + '%';
        });
      }
      this.setState({
        data: data
      });
    }.bind(this));
  },
  handleKeypress: _.throttle(function() {
    this.setState({
      filter: this.refs.search.getDOMNode().value
    });
  }, 100),
  sort: function(attr) {
    if (this.state.sortBy == attr) {
      this.setState({
        order: this.state.order == '+' ? '-' : '+'
      });
    } else {
      this.setState({
        sortBy: attr,
        order: '+'
      });
    }
  },
  render: function() {
    if (!this.state.data.length) return (<div />);
    var data = this.state.data;
    var filter = this.state.filter.toLowerCase();
    var first;

    // filter data
    if (this.state.filter) {
      data = data.filter(function(d) {
        return _.values(d).some(function(v) {
          return isNum(v) ? false : v.toLowerCase().indexOf(filter) > -1;
        });
      });
    }

    // sort data
    if (this.state.sortBy && data.length) {
      first = data[0][this.state.sortBy];
      if (isNum(first)) {
        data = _.sortBy(data, function(d) {
          return (this.state.order == '-' ? 1 : -1) * d[this.state.sortBy];
        }.bind(this));
      } else if (isPct(first)) {
        data = _.sortBy(data, function(d) {
          return (this.state.order == '-' ? 1 : -1) * parseInt(d[this.state.sortBy], 10);
        }.bind(this));
      } else {
        data = _.sortBy(data, function(d) { return d[this.state.sortBy]; }.bind(this));
        data = this.state.order == '-' ? data.reverse() : data;
      }
    }

    var trs = data.map(function(d, i) {
      return (
        <tr key={i}>
          { this.props.headers.map(function(h, i) {return (<td key={i}>{d[h[0]]}</td>);}) }
        </tr>
      );
    }.bind(this));

    function makeHeader(h, i) {
      return (<Header key={i} name={h[1]} attr={h[0]} sort={this.sort} sortBy={this.state.sortBy} order={this.state.order} />);
    }

    return (
      <div>
        <div>
          <div className="u-pull-right">
            <input type="text" placeholder="Search..." ref="search" onChange={this.handleKeypress} />
          </div>
        </div>
        <table className="main-table u-full-width">
          <thead>
            <tr>
              { this.props.headers.map(makeHeader.bind(this)) }
            </tr>
          </thead>
          <tbody>
            {trs}
          </tbody>
        </table>
      </div>
    );
  }
});

var Header = React.createClass({
  handleClick: function() {
    this.props.sort(this.props.attr);
  },
  render: function() {
    var arrow = this.props.sortBy == this.props.attr ? (this.props.order == '+' ? '<' : '>') :
                '';
    return (
      <th onClick={this.handleClick}>
        {this.props.name}
        &nbsp;&nbsp;<span>{arrow}</span>
      </th>
    );
  }
});

var tableMeta = {
  'fights': {
    'headers': [
      ['id', 'Id'],
      ['date', 'Date'],
      ['stagename', 'Stage'],
      ['winnername', 'Winner'],
      ['player1name', 'Player 1'],
      ['character1name', 'Character 1'],
      ['player2name', 'Player 2'],
      ['character2name', 'Character 2']
    ]
  },
  'playermeta': {
    'headers': [
      ['name', 'Name'],
      ['total', 'Total Fights'],
      ['wins', 'Wins'],
      ['winpct', 'Win %']
    ]
  },
  'charactermeta': {
    'headers': [
      ['name', 'Name'],
      ['total', 'Total Fights'],
      ['wins', 'Wins'],
      ['winpct', 'Win %']
    ]
  },
  'stagemeta': {
    'headers': [
      ['name', 'Name'],
      ['total', 'Appearances'],
      ['ratingchange', 'Avg rating change']
    ]
  },
  'characterwins': {
    'headers': [
      ['playername', 'Player'],
      ['charactername', 'Character'],
      ['total', 'Total'],
      ['wins', 'Wins'],
      ['winpct', 'Win %'],
    ]
  },
  'stagewins': {
    'headers': [
      ['playername', 'Player'],
      ['stagename', 'Stage'],
      ['total', 'Total'],
      ['wins', 'Wins'],
      ['winpct', 'Win %'],
    ]
  },
  'playervs': {
    'headers': [
      ['player1name', 'Player 1'],
      ['player2name', 'Player 2'],
      ['total', 'Total'],
      ['wins', 'Wins'],
      ['winpct', 'Win %'],
    ]
  },
  'charactervs': {
    'headers': [
      ['character1name', 'Character 1'],
      ['character2name', 'Character 2'],
      ['total', 'Total'],
      ['wins', 'Wins'],
      ['winpct', 'Win %'],
    ]
  },
}

// table-type is given from the table router
var App = document.getElementById('app');
var tableType = App.getAttribute('type');
if (tableType && tableMeta[tableType]) {
  if (tableType == 'fights') {
    $.getJSON('/api/fights', function(d) {
      $('h1').text('All ' + d.length + ' fights');
    });
  }
  React.render(<Table url={'/api/'+tableType} headers={tableMeta[tableType].headers} />, App);
}
