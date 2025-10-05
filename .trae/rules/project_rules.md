Use environment variable `GITHUB_TOKEN` for authenticated GitHub API access.
Never store raw tokens in repository files.
use for png to svg converting 
import
Task Type
import/upload
File
Refer to our docs for more info.
convert
Task Type
convert
Input
Name of the input task.
Input Format
Input format of this task
Output Format
Output format of this task
Color Mode
Choose whether the output should be colored or black and white
Clustering
Should shapes be stacked on top of another or be disjoint?
Color Precision
8
Number of significant bits to use in an RGB channel.
Gradient Step
16
Color difference between gradient layers
Filter Speckle
4
Discard patches smaller than X px in size.
Curve Fitting
Choose curve fitting mode
Segment Length
4
Perform iterative subdivide smooth until all segments are shorter than this length.
Corner Threshold
60
Perform iterative subdivide smooth until all segments are shorter than this length
Splice Threshold
45
Minimum angle displacement (in degrees) to be considered a cutting point between curves
export-url
Task Type
export/url
Input
convert
x
Name(s) of the input task.
Filename
Specify a custom filename including extension.

{
    "tasks": {
        "import": {
            "operation": "import/upload"
        },
        "convert": {
            "operation": "convert",
            "input": "import",
            "input_format": "png",
            "output_format": "svg",
            "options": {
                "color-mode": "color",
                "clustering": "stacked",
                "color-precision": 8,
                "gradient-step": 16,
                "filter-speckle": 4,
                "curve-fitting": "spline",
                "segment-length": 4,
                "corner-threshold": 60,
                "splice-threshold": 45
            }
        },
        "export-url": {
            "operation": "export/url",
            "input": [
                "convert"
            ]
        }
    }
}

