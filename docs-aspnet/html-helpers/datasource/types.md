---
title: Types
page_title: Types
description: "Learn about the types of DataSource that are supported by the Telerik UI DataSource component for {{ site.framework }}."
slug: htmlhelper_datasourcetypes_aspnetcore
position: 2
---

# DataSource Types

The DataSource component supports built-in types of data binding.

To include the default data source types, add the `<script src="https://kendo.cdn.telerik.com/{{ site.mvcCoreVersion }}/js/kendo.aspnetmvc.min.js"></script>` script to your `_Layout.cshtml` file after the Kendo UI scripts.

The available DataSource types of data binding are:
* [Ajax](#ajax-datasource)
* [WebAPI](#webapi-datasource)
* [Custom](#custom-datasource)

## Ajax DataSource

The Ajax DataSource type of data binding is the most popular data source type and performs Ajax requests to retrieve or update data. It formats the request filter, sort, group, page, page size, and aggregates, and, out of the box, binds the model to a controller which expects a [`[DataSourceRequest]DataSourceRequest request`](/api/Kendo.Mvc.UI/DataSourceRequest) parameter. This allows you to use the [`ToDataSourceResult()`](/api/Kendo.Mvc.Extensions/QueryableExtensions) extension method and to return a collection that corresponds to the request without having to deal with data operations programmatically.

Additionally, you can use the `server-operation` or `.ServerOperation` property to enable or disable server operations:

* When enabled, all data operations like paging, sorting, grouping, etc. will be performed server-side. 
* When disabled, all data operations will be performed on the client, and the entire data set will be available for the DataSource. This approach is also applicable for the [WebAPI](#webapi-datasource) type of binding.


```HtmlHelper
     @(Html.Kendo().DataSource<OrderViewModel>()
        .Name("myDataSource")
        .Ajax(dataSource =>
        {
          dataSource
            .Read(read => read.Action("ReadOrders", "Home"))
            .Create(create => create.Action("CreateOrders", "Home"))
            .Update(update => update.Action("UpdateOrders", "Home"))
            .Destroy(destroy => destroy.Action("DestroyOrders", "Home"))
            .Sort(sort => sort.Add(field => field.ShipCountry).Ascending())
            .Filter(filter=>filter.Add(field=>field.ShipCountry).StartsWith("A"))
            .Group(group=>group.Add(field=>field.OrderID))
            .Aggregates(aggregates=>aggregates.Add(field=>field.ShipCountry).Count())
            .PageSize(2)
            .ServerOperation(true)
            .Model(model =>
                {
                model.Id(field => field.OrderID);
                model.Field(field => field.OrderID).Editable(false);
                model.Field(field => field.ShipCountry).DefaultValue("USA");
            });
        })
    )

    <script>
        myDataSource.read(); // A POST request will be sent to the HomeController ReadOrders action
    </script>  
```
{% if site.core %}
```TagHelper
    <kendo-datasource name="dataSource" type="DataSourceTagHelperType.Ajax" server-operation="false" page-size="5">
        <transport>
            <read url="/Home/ReadOrders" />
        </transport>
    </kendo-datasource>
```
{% endif %}
```HomeController

    public IActionResult ReadOrders([DataSourceRequest]DataSourceRequest request)
    {
        // Orders can be IQueriable or IEnumerable.
        // The result is a filtered, paged, grouped, and sorted collection.
        var result = orders.ToDataSourceResult(request);

        // response object : { AggregateResults: [], Data: [{},{}], Errors: null, Total: 7 }
        return Json(result);
    }
```

## WebAPI DataSource

The WebAPI DataSource type of data binding is designed for WebAPI projects and works in the same way as the Ajax data source.

```HtmlHelper
     @(Html.Kendo().DataSource<OrderViewModel>()
        .Name("myDataSource")
        .WebApi(dataSource =>
        {
          dataSource
            .Read(read => read.Action("Get", "Product"))
	    	.Create(create => create.Action("Post", "Product"))
	    	.Update(update => update.Action("Put", "Product", new { id = "{0}"} ))
	    	.Destroy(destroy => destroy.Action("DELETE", "Product", new { id = "{0}" }))
            .PageSize(2)
            .ServerOperation(true)
            .Model(model =>
                {
                model.Id(field => field.OrderID);
                model.Field(field => field.OrderID).Editable(false);
            });
        })
    )

    <script>
        myDataSource.read(); // A GET request will be sent to the ProductController Get action
    </script>  
```
{% if site.core %}
```TagHelper
    <!-- When you use the WebAPI DataSource type of data binding in an editable Grid, define the field types in the `schema` to use the correct editors for the field. -->

    <kendo-datasource name="dataSource1" type="DataSourceTagHelperType.WebApi" server-operation="true">
        <transport>
            <read url="/api/Product" />
        </transport>
        <schema>
            <model id="ProductID">
                <fields>
                    <field name="ProductID" type="number"></field>
                </fields>
            </model>
        </schema>
    </kendo-datasource>
```
{% endif %}
```ProductController

    [HttpGet]
	public DataSourceResult Get([DataSourceRequest]DataSourceRequest request)
    {
        // Orders can be IQueriable or IEnumerable.
        // The result is a filtered, paged, grouped, and sorted collection.
        var result = orders.ToDataSourceResult(request);

        // response object : { AggregateResults: [], Data: [{},{}], Errors: null, Total: 7 }
        return Json(result);
    }
```

## Custom DataSource

The Custom DataSource type of data binding is the default type of binding and provides full control over the [client-side API options of the Kendo UI for jQuery DataSource](https://docs.telerik.com/kendo-ui/api/javascript/data/datasource). For example, instead of using the `serverOperation` property, which is only applicable for the Ajax and WebApi types of data binding, you have to separately state the server operations (server-filtering, server-sorting, server-paging, server-grouping, and server-aggregates).

> The custom DataSource type of data binding is suitable for working with the `oData` and `oData-v4` services because of the [`type`](https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/configuration/type) property and of the usage of predefined transport and schema settings for consuming such services. Since the custom type binding is the default type, you can omit it in the DataSource declaration.

The following example demonstrates how to consume an OData service.

```HtmlHelper
	@(Html.Kendo().DataSource<AspNet{{ site.framework_short }}Grid.Models.OrderViewModel>()
        .Name("myDataSource")
        .Custom(dataSource =>
        {
            dataSource
            .Type("odata")
            .ServerPaging(true)
            .ServerFiltering(true)
            .ServerSorting(true)
            .Transport(transport => {
                  transport.Read(read => {
                      read.Url("https://demos.telerik.com/kendo-ui/service/Northwind.svc/Orders")
                      .DataType("jsonp");
                  });
              });
        })
    )
    <script>
       myDataSource.fetch();
    </script>
```
{% if site.core %}
```TagHelper
	<kendo-datasource name="dataSource1" custom-type="odata">
	    <transport>
	        <read url="https://demos.telerik.com/kendo-ui/service/Northwind.svc/Orders" />
	    </transport>
	</kendo-datasource>

	<kendo-grid name="grid" datasource-id="dataSource1">
	    <pageable enabled="true">
	    </pageable>
	    <columns>
	        <column field="ShipName"></column>
	        <column field="ShipCity"></column>
	    </columns>
	    <scrollable enabled="true" />
	</kendo-grid>
```
{% endif %}

## See Also

* [Server-Side API](/api/datasource)
