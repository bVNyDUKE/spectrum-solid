# Spectrum analyzer SolidJS

Optimized version of spectrum analysis with solid from [jherr](https://github.com/jherr/solid-spectrum-graph)

## Fixes

Fixed issues with memory caused by For loop. Reduced GC jank since we're not longer creating a bunch of elements.
This better utilizes the SolidJS fine-grained reactivity and D3 joins.

