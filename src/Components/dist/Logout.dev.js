"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _reactRouterDom = require("react-router-dom");

var _axiosInterceptor = _interopRequireDefault(require("./Interceptors/axiosInterceptor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function Logout() {
  var navigate = (0, _reactRouterDom.useNavigate)();

  var handleLogout = function handleLogout() {
    var response;
    return regeneratorRuntime.async(function handleLogout$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return regeneratorRuntime.awrap(_axiosInterceptor["default"].post('/logout'));

          case 3:
            response = _context.sent;

            if (response.status === 200) {
              // Clear local storage, session storage, and cookies
              localStorage.clear();
              sessionStorage.clear();
              document.cookie.split(";").forEach(function (c) {
                document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
              }); // Redirect to login or home page

              navigate('/'); // Replace '/' with your desired route after logout

              alert('Logout successful');
            } else {
              console.error('Logout failed:', response.data);
              alert("Logout failed: ".concat(response.data));
            }

            _context.next = 11;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            console.error('Error during logout:', _context.t0);
            alert('Server error during logout');

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[0, 7]]);
  };

  return onClick = {
    handleLogout: handleLogout
  } // <button onClick={handleLogout}>Logout</button>
  ;
}

var _default = Logout;
exports["default"] = _default;