
"""
Usage example

1. Join switches (use your favorite method):
$ sudo mn --controller remote --topo tree,depth=3

2. Run this application:
$ PYTHONPATH=. ./bin/ryu run \
    --observe-links ryu/app/gui_topology/gui_topology.py

3. Access http://<ip address of ryu host>:8080 with your web browser.
"""

import os

from webob.static import DirectoryApp

from ryu.app.wsgi import ControllerBase, WSGIApplication, route
from ryu.app.rest_topology import TopologyController
from ryu.base import app_manager


PATH = os.path.dirname(__file__)

# Serving static files
class TrafficControlApp(app_manager.RyuApp):
    _CONTEXTS = {
        'wsgi': WSGIApplication,
    }

    def __init__(self, *args, **kwargs):
        super(TrafficControlApp, self).__init__(*args, **kwargs)

        wsgi = kwargs['wsgi']
        wsgi.register(TrafficControlController)
        wsgi.register(TopologyController)


class TrafficControlController(ControllerBase):
    def __init__(self, req, link, data, **config):
        super(TrafficControlController, self).__init__(req, link, data, **config)
        path = "%s/html/" % PATH
        self.static_app = DirectoryApp(path)

    @route('topology', '/{filename:(js/\w+.js|css/\w+.css|.?)}')
    def static_handler(self, req, **kwargs):
        if kwargs['filename']:
            print(kwargs['filename'])
            req.path_info = kwargs['filename']
        return self.static_app(req)

app_manager.require_app('ryu.app.rest_topology')
app_manager.require_app('ryu.app.ws_topology')
app_manager.require_app('ryu.app.ofctl_rest')