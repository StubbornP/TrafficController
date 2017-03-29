#!/usr/bin/python

"""
Create a network where different switches are connected to
different controllers, by creating a custom Switch() subclass.
"""

from mininet.net import Mininet
from mininet.node import OVSSwitch, Controller, RemoteController
from mininet.topolib import TreeTopo
from mininet.log import setLogLevel
from mininet.cli import CLI

setLogLevel( 'info' )

# Two local and one "external" controller (which is actually c0)
# Ignore the warning message that the remote isn't (yet) running

c1 = RemoteController( 'c1', ip='127.0.0.1', port=6633 )


topo = TreeTopo( depth=2, fanout=3 )
net = Mininet( topo=topo, build=False )

net.addController(c1)

net.build()
net.start()
CLI( net )
net.stop()

