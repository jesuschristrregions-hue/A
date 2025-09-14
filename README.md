# 3D Galaxy Simulation

This repository contains a Python program that renders a spiral galaxy using
`PyQt5` and `pyqtgraph`. Sliders allow you to control star count, number of
spiral arms, twist, spread, core radius, disk radius, and rotation speed.

## Requirements
Install dependencies:

```bash
pip install pyqt5 pyqtgraph numpy pyopengl
```

## Run

```bash
python galaxy_sim.py
```

A window will open with a 3D view of the galaxy on the left and sliders on the
right. White star particles orbit the center, and you can drag with the mouse
to rotate the camera or use the mouse wheel to zoom. Adjust the sliders to
regenerate the galaxy or change the rotation speed.

## Troubleshooting

If you encounter a `SyntaxError` referencing lines that begin with words like
`index` or `diff`, you may have accidentally saved a Git patch instead of the
Python source file. Download the raw `galaxy_sim.py` file or copy only the
Python code.

If the program raises `ModuleNotFoundError: No module named 'OpenGL'`, install
the `PyOpenGL` package.
