---
title: Scale
page_title: Scale
description: "Learn the Options of the Scale of the Telerik UI ArcGauge component for {{ site.framework }}."
slug: scale_arcgaugehelper_aspnetcore
position: 2
---

## Arc Gauge Scale

The scale of the Telerik UI ArcGauge for {{ site.framework }} renders the values, pointers and labels. It can be customized by adding the  `Scale` option to the widget. The `Scale` exposes the following child options:

* [Min and Max](#min-and-max)

* [MinorUnit and MajorUnit](#minorunit-and-majorunit)

* [Reverse](#reverse)

## Min and Max

* The `Min` (`double`) sets the lowest value of the widget.

* The `Max` (`double`) sets the maximum value of the widget.

```HtmlHelper
    @(Html.Kendo().ArcGauge()
        .Name("gauge")
        .Value(65)
        .Scale(x => x.Min(0).Max(100))
    )
```

## MinorUnit and MajorUnit

* The `MajorUnit` (`double`) parameter controls the interval between the major unit divisions of the widget. The values provided to the arc gauge's `Pointer` will render as a `MajorUnit` tick. The labels will be rendered next to the `MajorUnit` ticks.

* The `MinorUnit` (`double`) parameter controls the interval between the minor unit divisions of the widget.

```HtmlHelper
    @(Html.Kendo().ArcGauge()
        .Name("gauge")
        .Value(65)
        .Scale(x => x.MajorUnit(20).MinorUnit(5))
    )
```

## Reverse

Reverses the scale direction - values are increased counterclockwise.

````CSHTML
    @(Html.Kendo().ArcGauge()
        .Name("gauge")
        .Value(65)
        .Scale(x => x.Reverse(true))
    )
````

## See Also

* [Overview of the ArcGauge]({%slug overview_arcgaugehelper_aspnetcore%})