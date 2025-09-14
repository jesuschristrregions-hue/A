#!/usr/bin/env python3
"""Interactive 3D spiral galaxy simulator with adjustable parameters.

Requires :mod:`PyQt5`, :mod:`pyqtgraph`, :mod:`numpy`, and :mod:`PyOpenGL`.
"""

import sys
import numpy as np
from PyQt5 import QtCore, QtWidgets
import pyqtgraph as pg
import pyqtgraph.opengl as gl


class GalaxyWidget(QtWidgets.QWidget):
    """Interactive 3D spiral galaxy simulation."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("3D Galaxy Simulation")

        # Layout: 3D view on left, controls on right
        layout = QtWidgets.QHBoxLayout(self)
        self.view = gl.GLViewWidget()
        self.view.opts["distance"] = 80
        self.view.setBackgroundColor("k")
        layout.addWidget(self.view, 1)

        controls = QtWidgets.QWidget()
        controls.setFixedWidth(260)
        self.control_layout = QtWidgets.QVBoxLayout(controls)
        layout.addWidget(controls)

        # Parameter definitions: min, max, step, default, scale for slider precision
        self.param_defs = {
            "Stars":       dict(min=100, max=20000, step=100,  value=5000, scale=1),
            "Arms":        dict(min=1,   max=6,     step=1,    value=3,    scale=1),
            "Twist":       dict(min=0,   max=10,    step=0.1,  value=5,    scale=10),
            "Spread":      dict(min=0,   max=2,     step=0.05, value=0.4,  scale=20),
            "Core Radius": dict(min=0,   max=10,    step=0.1,  value=2,    scale=10),
            "Disk Radius": dict(min=10,  max=50,    step=1,    value=30,   scale=1),
            "Rotation":    dict(min=0,   max=2,     step=0.05, value=0.2,  scale=20),  # degrees/frame
        }

        self.sliders = {}
        for name, spec in self.param_defs.items():
            row = QtWidgets.QHBoxLayout()
            label = QtWidgets.QLabel(name)
            slider = QtWidgets.QSlider(QtCore.Qt.Horizontal)
            slider.setMinimum(int(spec["min"] * spec["scale"]))
            slider.setMaximum(int(spec["max"] * spec["scale"]))
            slider.setSingleStep(int(spec["step"] * spec["scale"]))
            slider.setValue(int(spec["value"] * spec["scale"]))
            value_label = QtWidgets.QLabel(str(spec["value"]))

            if name != "Rotation":
                slider.valueChanged.connect(self.update_galaxy)
            slider.valueChanged.connect(lambda v, l=value_label, s=spec: l.setText(f"{v / s['scale']:.2f}"))

            row.addWidget(label)
            row.addWidget(slider)
            row.addWidget(value_label)
            self.control_layout.addLayout(row)
            self.sliders[name] = slider

        self.star_plot = gl.GLScatterPlotItem()
        self.view.addItem(self.star_plot)
        self.update_galaxy()

        self.timer = QtCore.QTimer()
        self.timer.timeout.connect(self.rotate)
        self.timer.start(16)  # roughly 60 FPS

    def param(self, name: str) -> float:
        spec = self.param_defs[name]
        return self.sliders[name].value() / spec["scale"]

    def generate_positions(self):
        count = int(self.param("Stars"))
        arms = int(self.param("Arms"))
        twist = self.param("Twist")
        spread = self.param("Spread")
        core = self.param("Core Radius")
        disk = self.param("Disk Radius")

        idx = np.arange(count)
        arm = idx % arms
        radius = np.random.rand(count) * disk
        angle = radius * twist + arm * (2 * np.pi / arms)
        deviation = (np.random.rand(count) - 0.5) * spread * radius

        x = (radius + core) * np.cos(angle) + deviation * np.cos(angle + np.pi / 2)
        y = (np.random.rand(count) - 0.5) * core
        z = (radius + core) * np.sin(angle) + deviation * np.sin(angle + np.pi / 2)
        return np.vstack((x, y, z)).T

    def update_galaxy(self):
        pos = self.generate_positions()
        self.star_plot.resetTransform()
        self.star_plot.setData(pos=pos, color=(1, 1, 1, 0.8), size=1)

    def rotate(self):
        speed = self.param("Rotation")
        if speed:
            self.star_plot.rotate(speed, 0, 1, 0)


if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    w = GalaxyWidget()
    w.resize(1000, 700)
    w.show()
    sys.exit(app.exec_())
