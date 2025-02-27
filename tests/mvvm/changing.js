(function() {

    describe("mvvm observing", function() {
        beforeEach(function() {
            this.sourceBinder = kendo.data.binders.source;
            Mocha.fixture.append(
                '<script id="src-bind-template" type="text/x-kendo-template">' +
                '  <div>' +
                '    <input data-bind="value: value" />' +
                '    <span class="val" data-bind="text: value"></span>' +
                '  </div>' +
                '</script>' +
                '<script id="src-bind-template-w-select" type="text/x-kendo-template">' +
                '  <div>' +
                '    <input data-bind="value: value" />' +
                '    <span class="val" data-bind="text: value"></span>' +
                '    <select data-bind="source: options" data-text-field="name" data-value-field="uid"></select>' +
                '  </div>' +
                '</script>' +
                '<script id="array-template" type="text/x-kendo-template">' +
                '<li data-bind="text:name"></li>' +
                '</script>' +
                '<script id="ul-template" type="text/x-kendo-template">' +
                '<li data-bind="text:root"></li>' +
                '</script>' +
                '<script id="ul-template-alias" type="text/x-kendo-template">' +
                '<li data-bind="text:rootAlias"></li>' +
                '</script>' +
                '<script id="ul-input-template" type="text/x-kendo-template">' +
                '<li><input data-bind="value:root" /></li>' +
                '</script>' +
                '<script id="ul-input-child-template" type="text/x-kendo-template">' +
                '<li><input data-bind="value:root.child"/></li>' +
                '</script>' +
                '<script id="simple-field-template" type="text/x-kendo-template">' +
                '#= get("foo") #' +
                '</script>' +
                '<script id="nested-field-template" type="text/x-kendo-template">' +
                '#= get("foo.bar") #' +
                '</script>' +
                '<script id="nested-field-template-multiple-gets" type="text/x-kendo-template">' +
                '#= get("foo").get("bar") #' +
                '</script>' +
                '<script>' +
                'var templateEvaluationCounter = 0;' +
                '</script>' +
                '<script id="counting-template" type="text/x-kendo-template">' +
                '# templateEvaluationCounter ++; #' +
                '#= get("foo") #' +
                '</script>' +
                '<script id="custom-binder-template" type="text/x-kendo-template">' +
                '<span data-bind="custom: this"></span>' +
                '</script>' +
                '<script id="if-else-template" type="text/x-kendo-template">' +
                '# if (get("foo") == "foo") { #' +
                '    #: get("foo") #' +
                '# } else { #' +
                '    #: get("bar") #' +
                '# } #' +
                '</script>'
            );
        });
        afterEach(function() {
            kendo.data.binders.source = this.sourceBinder;
        });

        it("changing a view model observable array updates the select options within a template", function() {
            var viewModel = kendo.observable({
                data: [
                    { "value": 1, options: [{ name: 1 }, { name: 2 }] },
                    { "value": 2, options: [{ name: 1 }, { name: 2 }] }
                ]
            });

            var dom = $('<div data-bind="source: data" data-template="src-bind-template-w-select"></div>');
            kendo.bind(dom, viewModel);
            viewModel.data[1].value = 1000;
            viewModel.set("data[0].options[0].name", "TEST1");
            viewModel.set("data[0].options[1].name", "TEST2");

            assert.equal(dom.find("option:eq(0)").text(), "TEST1");
            assert.equal(dom.find("option:eq(1)").text(), "TEST2");
            assert.equal(dom.find(".val:eq(1)").text(), "2");
        });

        it("changing a view model observable array updates only the value bound elements instead of the whole template", function() {
            var viewModel = kendo.observable({
                data: [
                    { "value": 1 },
                    { "value": 2 }
                ]
            });

            var dom = $('<div data-bind="source: data" data-template="src-bind-template"></div>');
            kendo.bind(dom, viewModel);
            viewModel.data[1].value = 1000;
            viewModel.set("data[0].value", 5);

            assert.equal(dom.find(".val:eq(1)").text(), "2");
        });

        it("changing a badge value reflects UI", function() {
            var viewModel = kendo.observable({
                foo: 55
            });

            var dom = $('<span data-role="badge" data-bind="text:foo"></span>');
            kendo.bind(dom, viewModel);
            viewModel.set("foo", 90);
            assert.equal(dom.text(), "90");
            kendo.destroy(dom);
        });

        it("changing a view model field updates the CSS classes in the UI", function() {
            var viewModel = kendo.observable({
                foo: false
            });

            var dom = $('<span data-bind="css:{active: foo}">Test CSS class</span>');
            kendo.bind(dom, viewModel);
            viewModel.set("foo", true);
            assert.equal(dom.hasClass("active"), true);
        });

        it("changing a view model field reflects UI", function() {
            var viewModel = kendo.observable({
                foo: "foo"
            });

            var dom = $('<span data-bind="text:foo"/>');
            kendo.bind(dom, viewModel);
            viewModel.set("foo", "bar");
            assert.equal(dom.text(), "bar");
        });

        it("changing a view model field reflects UI via array access", function() {
            var viewModel = kendo.observable({
                "1": "foo"
            });

            var dom = $('<span data-bind="text: [\'1\']"/>');
            kendo.bind(dom, viewModel);
            viewModel.set("['1']", "bar");
            assert.equal(dom.text(), "bar");
        });

        it("field name of nested view model remains the same", function() {
            var viewModel = kendo.observable({
                foo: {
                    bar: "bar"
                }
            });

            viewModel.foo.bind("change", function(e) {
                assert.equal(e.field, "bar");
            });

            viewModel.foo.set("bar", "baz");
        });

        it("changing a view model field from a view model function bound to UI reflects UI", function() {
            var viewModel = kendo.observable({
                foo: "foo",
                bar: function() {
                    this.set("foo", "baz");
                }
            });

            var dom = $('<div><span data-bind="text:foo"></span><button data-bind="click:bar"></button></div>');

            kendo.bind(dom, viewModel);

            assert.equal(dom.find("span").text(), "foo");

            dom.find("button").trigger("click");

            assert.equal(dom.find("span").text(), "baz");
        });

        it("removing item from view model array reflects UI", function() {
            var viewModel = kendo.observable({
                foo: ["foo", "bar", "baz"],
                bar: "boo" // needed to test closure value assignment
            });

            var dom = $('<select data-bind="source:foo"/>');

            kendo.bind(dom, viewModel);

            viewModel.foo.splice(1, 1);

            assert.equal(dom.find("option").length, 2);
            assert.equal(dom.find("option").first().text(), "foo");
            assert.equal(dom.find("option").last().text(), "baz");
        });

        it("adding item to array which is unbound isn't reflected in the ui", function() {
            var viewModel = kendo.observable({
                current: { items: [] },
                data: [{ items: ["foo"] }, { items: ["bar"] }],
            });


            var dom = $('<div><select data-bind="source:current.items"></select></div>');

            kendo.bind(dom, viewModel);

            viewModel.set("current", viewModel.data[0]);
            viewModel.set("current", viewModel.data[1]);

            viewModel.data[0].items.push("baz");

            assert.equal(dom.find("option").length, 1);
            assert.equal(dom.find("option").last().text(), "bar");
        });

        it("removing item from array removes table rows", function() {
            var viewModel = kendo.observable({
                foo: ["foo", "bar", "baz"],
                bar: "boo" // needed to test closure value assignment
            });

            var dom = $('<table data-bind="source:foo"/>');

            kendo.bind(dom, viewModel);

            viewModel.foo.splice(1, 1);

            assert.equal(dom.find("tr").length, 2);
            assert.equal(dom.find("tr").first().text(), "foo");
            assert.equal(dom.find("tr").last().text(), "baz");
        });

        it("change event notifies value listeners", function() {
            var viewModel = kendo.observable({
                foo: ["foo", "bar", "baz"],
                bar: "bar"
            });

            var dom = $('<div><select data-bind="source:foo,value:bar"></select><span data-bind="text:bar"></span></div>');

            kendo.bind(dom, viewModel);

            dom.find("option:first").prop("selected", true);
            dom.find("select").trigger("change");
            assert.equal(dom.find("span").text(), "foo");
        });

        it("the view model is updated when the change event is raised", function() {
            var viewModel = kendo.observable({
                foo: "",
                change: function() {
                    assert.equal(this.foo, "bar");
                }
            });

            var dom = $('<input data-bind="events: { change: change }, value: foo" />');

            kendo.bind(dom, viewModel);

            dom.val("bar").trigger("change");
        });

        it("keyup event notifies value listeners", function() {
            var viewModel = kendo.observable({
                foo: ["foo", "bar", "baz"],
                bar: "bar"
            });

            var dom = $('<div><input data-value-update="keyup" data-bind="value:bar"/><span data-bind="text:bar"></span></div>');

            kendo.bind(dom, viewModel);

            dom.find("input").val("foo").trigger("keyup");

            assert.equal(dom.find("span").text(), "foo");
        });

        it("changing value when value update mode is keyup does not reset the input value", function() {
            var viewModel = kendo.observable({
                bar: "bar"
            });

            var dom = $('<div><input data-value-update="keyup" data-bind="value:bar"/><span data-bind="text:bar"></span></div>');

            kendo.bind(dom, viewModel);

            viewModel.bind("get", function(e) {
                assert.isOk(true, "Should be called only for the span");
            });

            dom.find("input").val("foo")
                .trigger("keyup");
        });

        it("changing ui updates view model with array accessor", function() {
            var viewModel = kendo.observable({
                "1": "bar"
            });

            var dom = $('<input data-bind="value:[\'1\']"/>');

            kendo.bind(dom, viewModel);

            dom.val("foo").trigger("change");

            assert.equal(viewModel["1"], "foo");
        });

        it("select of multi select updates the viewModel", function() {
            var viewModel = kendo.observable({
                foo: ["foo", "bar", "baz"],
                selectedItems: []
            });

            var dom = $('<select data-bind="source:foo,value:selectedItems" multiple="multiple"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:first").attr("selected", "selected");
            dom.find("option:last").attr("selected", "selected");
            dom.trigger("change");

            assert.equal(viewModel.selectedItems[0], "foo");
            assert.equal(viewModel.selectedItems[1], "baz");
        });

        it("tracking changes of the parent object", function() {
            var dom = $('<div data-bind="text: current.name"/>');

            var viewModel = kendo.observable({
                current: null,
                items: [{ name: "foo" }, { name: "bar" }]
            });

            viewModel.current = viewModel.items[0];

            kendo.bind(dom, viewModel);

            viewModel.set("current", viewModel.items[1]);

            assert.equal(dom.text(), "bar");
        });

        it("tracking changes of array item members", function() {
            var dom = $('<div data-bind="text: items[0].name"/>');

            var viewModel = kendo.observable({
                items: [{ name: "foo" }]
            });


            kendo.bind(dom, viewModel);

            viewModel.items[0].set("name", "bar");

            assert.equal(dom.text(), "bar");
        });

        it("tracking changes the array item", function() {
            var dom = $('<div data-bind="text: items[0].name"/>');

            var viewModel = kendo.observable({
                items: [{ name: "foo" }]
            });

            kendo.bind(dom, viewModel);

            viewModel.items.splice(0, 0, { name: "bar" });

            assert.equal(dom.text(), "bar");
        });

        it("select of multi select bound to complex objects", function() {
            var viewModel = kendo.observable({
                foo: [{ name: "foo" }, { name: "bar" }],
                selectedItems: []
            });

            var dom = $('<select data-value-field="name" data-bind="source:foo,value:selectedItems" multiple="multiple"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:first").attr("selected", "selected");
            dom.find("option:last").attr("selected", "selected");
            dom.trigger("change");

            assert.equal(viewModel.selectedItems[0], viewModel.foo[0]);
            assert.equal(viewModel.selectedItems[1], viewModel.foo[1]);
        });

        it("select tracks complex value", function() {
            var viewModel = kendo.observable({
                foo: [{ text: "foo" }, { text: "bar" }],
                selectedItem: null
            });

            viewModel.selectedItem = viewModel.foo[0];

            var dom = $('<select data-value-field="text" data-bind="source:foo,value:selectedItem"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;

            dom.trigger("change");
            dom.triggerHandler("change");

            assert.strictEqual(viewModel.selectedItem, viewModel.foo[1]);
        });

        it("select uses data value field if data-value-primitive is set to true", function() {
            var viewModel = kendo.observable({
                foo: [{ text: "foo" }, { text: "bar" }],
                selectedItem: null
            });

            viewModel.selectedItem = viewModel.foo[0];

            var dom = $('<select data-value-field="text" data-value-primitive="true" data-bind="source:foo,value:selectedItem"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;

            dom.trigger("change");
            dom.triggerHandler("change");

            assert.strictEqual(viewModel.selectedItem, viewModel.foo[1].text);
        });

        it("select with data-type='number', souce binding and value primitive", function() {
            var viewModel = kendo.observable({
                foo: [{ id: 1, name: "foo" }, { id: new Date(), name: "bar" }],
                selectedItem: null
            });

            var dom = $('<select data-type="number" data-value-primitive="true" data-text-field="name" data-value-field="id" data-bind="source: foo, value: selectedItem"> </select>');

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;

            dom.trigger("change");
            dom.triggerHandler("change");

            assert.strictEqual(viewModel.selectedItem, viewModel.foo[1].id);
        });

        it("select with souce binding and value primitive", function() {
            var viewModel = kendo.observable({
                foo: [{ id: 1, name: "foo" }, { id: new Date(), name: "bar" }],
                selectedItem: null
            });

            var dom = $('<select data-value-primitive="true" data-text-field="name" data-value-field="id" data-bind="source: foo, value: selectedItem"> </select>');

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;

            dom.trigger("change");
            dom.triggerHandler("change");

            assert.strictEqual(viewModel.selectedItem, viewModel.foo[1].id);
        });

        it("select uses data value field if data-value-primitive is set to true with data source", function() {
            var viewModel = kendo.observable({
                foo: new kendo.data.DataSource({ data: [{ text: "foo" }, { text: "bar" }] }),
                selectedItem: ""
            });

            viewModel.selectedItem = viewModel.foo[0];

            var dom = $('<select data-value-field="text" data-text-field="text" data-value-primitive="true" data-bind="source:foo,value:selectedItem"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;

            dom.trigger("change");
            dom.triggerHandler("change");

            assert.strictEqual(viewModel.selectedItem, viewModel.foo.view().at(1).text);
        });

        it("select works with data source and existing selectedItem", function() {
            var ds = new kendo.data.DataSource({ data: [{ text: "foo" }, { text: "bar" }] });
            ds.read();

            var viewModel = kendo.observable({
                foo: ds,
                selectedItem: ds.at(0)
            });

            var dom = $('<select data-text-field="text" data-value-field="text" data-bind="source:foo,value:selectedItem"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;

            dom.trigger("change");
            dom.triggerHandler("change");

            assert.strictEqual(viewModel.selectedItem, viewModel.foo.view().at(1));
        });


        it("select works with data source and an initial null value", function() {
            var ds = new kendo.data.DataSource({ data: [{ text: "foo" }, { text: "bar" }] });

            var viewModel = kendo.observable({
                foo: ds,
                selectedItem: null
            });

            var dom = $('<select data-text-field="text" data-value-field="text" data-bind="source:foo,value:selectedItem"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;

            dom.trigger("change");
            dom.triggerHandler("change");

            assert.strictEqual(viewModel.selectedItem, viewModel.foo.view().at(1));
        });

        it("select tracks complex value if text-field is set", function() {
            var viewModel = kendo.observable({
                foo: [{ text: "foo" }, { text: "bar" }],
                selectedItem: null
            });

            viewModel.selectedItem = viewModel.foo[0];

            var dom = $('<select data-text-field="text" data-bind="source:foo,value:selectedItem"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;

            dom.trigger("change");

            assert.strictEqual(viewModel.selectedItem, viewModel.foo[1]);
        });

        it("multi select tracks complex value if text-field is set", function() {
            var viewModel = kendo.observable({
                foo: [{ text: "foo" }, { text: "bar" }],
                selectedItems: []
            });

            viewModel.selectedItem = viewModel.foo[0];

            var dom = $('<select multiple="multiple" data-text-field="text" data-bind="source:foo,value:selectedItems"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:last").attr("selected", "selected");

            dom.trigger("change");

            assert.strictEqual(viewModel.selectedItems[0], viewModel.foo[1]);
        });

        it("select bound to complex object updates simple value", function() {
            var viewModel = kendo.observable({
                foo: [{ text: "foo" }, { text: "bar" }],
                selectedItem: "foo"
            });

            var dom = $('<select data-value-field="text" data-bind="source:foo,value:selectedItem"/>');

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;

            dom.trigger("change");

            assert.strictEqual(viewModel.selectedItem, "bar");
        });

        it("multi select has same item count after change", function() {
            var viewModel = kendo.observable({
                items: ["foo", "bar", "baz"],
                selectedItems: []
            });

            var dom = $('<select data-bind="source:items,value:selectedItems" multiple="multiple" />');

            kendo.bind(dom, viewModel);

            dom.find("option:first").attr("selected", "selected");
            dom.trigger("change");
            dom.find("option:last").attr("selected", "selected");
            dom.trigger("change");

            assert.equal(dom.find("option").length, 3);
        });

        it("changing the value updates the view model", function() {
            var dom = $('<input data-bind="value:foo" />');

            var viewModel = kendo.observable({ foo: "foo" });

            kendo.bind(dom, viewModel);

            dom.val("bar");
            dom.trigger("change");

            assert.equal(viewModel.foo, "bar");
        });

        it("changing the number type input value updates the view model", function() {
            var dom = $('<input data-type="number" data-bind="value:foo" />');

            var viewModel = kendo.observable({ foo: -1.23 });

            kendo.bind(dom, viewModel);

            dom.val(5.4321);
            dom.trigger("change");

            assert.equal(viewModel.foo, 5.4321);
        });

        it("changing the date type input value updates the view model", function() {
            var dom = $('<input data-type="date" data-bind="value:foo" />');

            var viewModel = kendo.observable({ foo: new Date() });

            kendo.bind(dom, viewModel);

            dom.val("2015-01-31");
            dom.trigger("change");

            assert.deepEqual(viewModel.foo, kendo.parseDate("2015-01-31"));
        });

        it("changing the boolean type input value updates the view model", function() {
            var dom = $('<input data-type="boolean" data-bind="value:foo" />');

            var viewModel = kendo.observable({ foo: false });

            kendo.bind(dom, viewModel);

            dom.val(true);
            dom.trigger("change");

            assert.equal(viewModel.foo, true);
        });

        it("changing the input value updates dependent observable", function() {
            var dom = $('<input data-bind="value:foo" />');

            var viewModel = kendo.observable({
                bar: "bar",
                foo: function(value) {
                    if (value !== undefined) {
                        this.set("bar", value);
                    } else {
                        return this.get("bar");
                    }
                }
            });

            kendo.bind(dom, viewModel);

            dom.val("foo");
            dom.trigger("change");

            assert.equal(viewModel.bar, "foo");
        });

        it("changing the input value updates dependent observable from the parent object", function() {
            var dom = $('<ul data-bind="source: items" data-template="ul-input-template">');

            var viewModel = kendo.observable({
                items: [
                    { bar: "bar" }
                ],
                root: function(item, value) {
                    if (value !== undefined) {
                        item.set("bar", value);
                    } else {
                        return item.get("bar");
                    }
                }
            });

            kendo.bind(dom, viewModel);

            dom.find("input").val("foo").trigger("change");

            assert.equal(viewModel.items[0].bar, "foo");
        });


        it("changing the value of pre populated select updates the view model", function() {
            var dom = $('<select data-bind="value:foo"><option value="foo">foo</option><option value="bar">bar</option>');

            var viewModel = kendo.observable({ foo: "foo" });

            kendo.bind(dom, viewModel);

            dom.find("option:first")[0].selected = false;
            dom.find("option:last")[0].selected = true;
            dom.trigger("change");

            assert.equal(viewModel.foo, "bar");
        });

        it("changing the value of pre populated multi select updates the view model", function() {
            var dom = $('<select data-bind="value:foo"><option value="foo">foo</option><option value="bar">bar</option>');

            var viewModel = kendo.observable({ foo: [] });

            kendo.bind(dom, viewModel);

            dom.find("option:last").attr("selected", "selected");
            dom.trigger("change");

            assert.equal(viewModel.foo[0], "bar");
        });

        it("changing the value of pre populated number type multi select updates the view model", function() {
            var dom = $('<select multiple="multiple" data-type="number" data-bind="value:foo"><option value="1">1</option><option value="-1.23">2</option>');

            var viewModel = kendo.observable({ foo: [] });

            kendo.bind(dom, viewModel);

            dom.find("option:last").attr("selected", "selected");
            dom.trigger("change");

            assert.strictEqual(viewModel.foo[0], -1.23);
        });

        it("changing the value of pre populated boolean type multi select updates the view model", function() {
            var dom = $('<select multiple="multiple" data-type="boolean" data-bind="value:foo"><option value="0">1</option><option value="true">2</option>');

            var viewModel = kendo.observable({ foo: [] });

            kendo.bind(dom, viewModel);

            dom.find("option").attr("selected", "selected");
            dom.trigger("change");

            assert.strictEqual(viewModel.foo[0], false);
            assert.strictEqual(viewModel.foo[1], true);
        });

        it("changing the value of pre populated date type multi select updates the view model", function() {
            var dom = $('<select multiple="multiple" data-type="date" data-bind="value:foo"><option value="2015-1-1">1</option><option value="2015-11-1">2</option>');

            var viewModel = kendo.observable({ foo: [] });

            kendo.bind(dom, viewModel);

            dom.find("option").attr("selected", "selected");
            dom.trigger("change");

            assert.deepEqual(viewModel.foo[0], kendo.parseDate("2015-1-1", "yyyy-MM-dd"));
            assert.deepEqual(viewModel.foo[1], kendo.parseDate("2015-11-1", "yyyy-MM-dd"));
        });

        it("changing radiobutton value updates the view model", function() {
            var dom = $('<input type="radio" value="bar"  data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: "" });

            kendo.bind(dom, viewModel);

            dom.attr("checked", true);
            dom.trigger("change");

            assert.equal(viewModel.foo, "bar");
        });

        it("changing radiobutton number value updates the view model", function() {
            var dom = $('<input type="radio" data-type="number" value="-3.14"  data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: 123 });

            kendo.bind(dom, viewModel);

            dom.attr("checked", true);
            dom.trigger("change");

            assert.strictEqual(viewModel.foo, -3.14);
        });

        it("changing radiobutton boolean value updates the view model", function() {
            var dom = $('<input type="radio" data-type="boolean" value="false"  data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: true });

            kendo.bind(dom, viewModel);

            dom.attr("checked", true);
            dom.trigger("change");

            assert.strictEqual(viewModel.foo, false);
        });

        it("changing radiobutton date value updates the view model", function() {
            var dom = $('<input type="radio" data-type="date" value="2015-1-1"  data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: new Date() });

            kendo.bind(dom, viewModel);

            dom.attr("checked", true);
            dom.trigger("change");

            assert.deepEqual(viewModel.foo, kendo.parseDate("2015-1-1", "yyyy-MM-dd"));
        });

        it("changing checkbox value updates the view model", function() {
            var dom = $('<input type="checkbox" data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: false });

            kendo.bind(dom, viewModel);

            dom.prop("checked", true);
            dom.trigger("change");

            assert.equal(viewModel.foo, true);
        });

        it("changing checkbox does not add the value updates the view model", function() {
            var dom = $('<input type="checkbox" value="true" data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: true });

            kendo.bind(dom, viewModel);

            dom.prop("checked", false);
            dom.trigger("change");

            assert.equal(viewModel.foo, false);
        });

        it("changing checkbox value updates the view model with the checked state", function() {
            var dom = $('<input type="checkbox" value="foo" data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: false });

            kendo.bind(dom, viewModel);

            dom.prop("checked", true);
            dom.trigger("change");

            assert.equal(viewModel.foo, true);
        });

        it("checking checkbox adds the number value to the view model", function() {
            var dom = $('<input type="checkbox" data-type="number" value="-3.14" data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: [] });

            kendo.bind(dom, viewModel);

            dom.attr("checked", true);
            dom.trigger("change");

            assert.strictEqual(viewModel.foo[0], -3.14);
        });

        it("checking checkbox adds the boolean value to the view model", function() {
            var dom = $('<input type="checkbox" data-type="boolean" value="true" data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: [] });

            kendo.bind(dom, viewModel);

            dom.attr("checked", true);
            dom.trigger("change");

            assert.strictEqual(viewModel.foo[0], true);
        });

        it("checking checkbox w/ numberic value adds a boolean value to the view model", function() {
            var dom = $('<input type="checkbox" data-type="boolean" value="0" data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: [] });

            kendo.bind(dom, viewModel);

            dom.attr("checked", true);
            dom.trigger("change");

            assert.strictEqual(viewModel.foo[0], false);
        });

        it("checking checkbox adds the date value to the view model", function() {
            var dom = $('<input type="checkbox" data-type="date" value="2015-1-1" data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: [] });

            kendo.bind(dom, viewModel);

            dom.attr("checked", true);
            dom.trigger("change");

            assert.deepEqual(viewModel.foo[0], kendo.parseDate("2015-1-1", "yyyy-MM-dd"));
        });

        it("checking checkbox adds the value to the view model", function() {
            var dom = $('<input type="checkbox" value="bar" data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: [] });

            kendo.bind(dom, viewModel);

            dom.attr("checked", true);
            dom.trigger("change");

            assert.equal(viewModel.foo[0], "bar");
        });

        it("unchecking checkbox removes the value from the view model", function() {
            var dom = $('<input type="checkbox" value="bar" data-bind="checked:foo"/>');

            var viewModel = kendo.observable({ foo: ["bar"] });

            kendo.bind(dom, viewModel);

            dom.attr("checked", false);
            dom.trigger("change");

            assert.isOk(!viewModel.foo.length);
        });

        it("value binding calls set once during select change", function() {
            var viewModel = kendo.observable({
                foo: ["foo", "bar", "baz"],
                bar: "bar"
            });

            var calls = 0;

            var dom = $('<select data-bind="source:foo,value:bar"/>');

            kendo.bind(dom, viewModel);

            viewModel.set("bar", "foo");

            viewModel.set = function() {
                calls++;
                kendo.data.ObservableObject.fn.set.apply(this, arguments);
            };

            dom.find("select").val("bar");
            dom.trigger("change");

            assert.equal(calls, 1);
        });

        it("select value which doesn't exist sets selectedIndex to -1", function() {
            var viewModel = kendo.observable({
                foo: ["foo", "bar"],
                bar: "bar"
            });

            var calls = 0;

            var dom = $('<select data-bind="source:foo,value:bar"/>');

            kendo.bind(dom, viewModel);

            viewModel.set("bar", "baz");

            assert.equal(dom[0].selectedIndex, -1);
        });

        it("tracking changes of observable items in array", function() {
            var viewModel = kendo.observable({
                foo: [{ name: "foo" }]
            });

            var dom = $('<ul data-template="array-template" data-bind="source:foo"/>');

            kendo.bind(dom, viewModel);

            viewModel.foo[0].set("name", "bar");

            assert.equal(dom.find("li").text(), "bar");
        });

        it("replacing the source array rebinds the element", function() {
            var viewModel = kendo.observable({
                foo: [{ name: "foo" }]
            });

            var dom = $('<ul data-template="array-template" data-bind="source:foo"/>');

            kendo.bind(dom, viewModel);

            viewModel.set("foo", [{ name: "bar" }]);

            assert.equal(dom.find("li").text(), "bar");
        });

        it("tracking changes of fields bound to style", function() {
            var viewModel = kendo.observable({
                foo: "1px",
                bar: "10px"
            });

            var dom = $('<span data-bind="style: { left: foo, top: bar }"/>');

            kendo.bind(dom, viewModel);

            viewModel.set("foo", "2px");
            viewModel.set("bar", "20px");

            assert.equal(dom.css("left"), "2px");
            assert.equal(dom.css("top"), "20px");
        });

        it("tracking changes of complex fields", function() {
            var dom = $('<div data-bind="attr: { title:bar }, text:foo.bar"/>');

            var viewModel = kendo.observable({
                foo: {
                    bar: "bar"
                },
                bar: "boo"
            });

            kendo.bind(dom, viewModel);

            viewModel.foo.set("bar", "baz");

            assert.equal(dom.text(), "baz");
            //check that parent field is not changed
            assert.equal(dom.attr("title"), "boo");
        });

        it("tracking changes in templates", function() {
            var dom = $('<div data-template="simple-field-template" data-bind="source: this" />');

            var viewModel = kendo.observable({ foo: "foo" });

            kendo.bind(dom, viewModel);

            viewModel.set("foo", "bar");

            assert.equal(dom.text().trim(), "bar");
        });

        it("change event is fired once", function() {
            var dom = $('<div data-template="simple-field-template" data-bind="source: this" />');

            var viewModel = kendo.observable({ foo: "foo" });

            kendo.bind(dom, viewModel);

            viewModel.bind("change", function() {
                assert.isOk(true);
            });

            viewModel.set("foo", "bar");
        });

        it("dependencies are reavaluated", function() {
            var dom = $('<div data-template="if-else-template" data-bind="source: this" />');

            var viewModel = kendo.observable({ foo: "foo", bar: "bar" });

            kendo.bind(dom, viewModel);

            viewModel.set("foo", "baz");

            viewModel.set("bar", "boo");

            assert.equal(dom.text().trim(), "boo");
        });

        it("does not attach more than one change handler when monitoring for dependency changes", function() {
            var dom = $('<div data-template="counting-template" data-bind="source:this" />');

            var viewModel = kendo.observable({ foo: "foo" });

            kendo.bind(dom, viewModel);

            viewModel.set("foo", "baz");

            templateEvaluationCounter = 0;

            viewModel.set("foo", "boo");

            assert.equal(templateEvaluationCounter, 1);
        });

        it("refreshing the source destroys the binder objects", function() {
            var dom = $('<div data-template="custom-binder-template" data-bind="source:this" />');

            var viewModel = kendo.observable({ foo: "foo" });

            kendo.data.binders.custom = kendo.data.Binder.extend({
                refresh: function() {
                },
                destroy: function() {
                    assert.isOk(true);
                }
            });

            kendo.bind(dom, viewModel);

            viewModel.set("foo", "baz");
        });

        it("removing an item from the source destroys the binder objects", function() {
            var dom = $('<div data-template="custom-binder-template" data-bind="source:foo" />');

            var viewModel = kendo.observable({ foo: [{}] });

            kendo.data.binders.custom = kendo.data.Binder.extend({
                refresh: function() {
                },
                destroy: function() {
                    assert.isOk(true);
                }
            });

            kendo.bind(dom, viewModel);

            viewModel.foo.splice(0, 1);
        });

        it("the click binding is destroyed", function() {
            var dom = $('<div data-bind="click: handler">');

            var viewModel = kendo.observable({
                handler: function() { }
            });

            kendo.bind(dom, viewModel);
            assert.equal(viewModel._events.change.length, 1);
            kendo.bind(dom, viewModel);
            assert.equal(viewModel._events.change.length, 1);
        });

        it("does not attach multiple event handlers to nested object", function() {
            var parent = kendo.observable({});
            var child = kendo.observable({});

            parent.set("child", child);
            parent.set("child", kendo.observable({}));
            parent.set("child", child);

            assert.equal(child._events["change"].length, 1);
            assert.equal(child._events["get"].length, 1);
        });

        it("does not attach multiple event handlers to nested array", function() {
            var parent = kendo.observable({});
            var child = new kendo.data.ObservableArray([]);

            parent.set("child", child);
            parent.set("child", kendo.observable({}));
            parent.set("child", child);

            assert.equal(child._events["change"].length, 1);
        });

        it("tracking changes when direct access and set are used", function() {
            var dom = $('<div data-template="nested-field-template" data-bind="source:this"/>');

            var viewModel = kendo.observable({
                foo: {
                    bar: "bar"
                }
            });

            kendo.bind(dom, viewModel);

            viewModel.foo.set("bar", "baz");

            assert.equal(dom.text().trim(), "baz");
        });

        it("tracking changes when single set is used", function() {
            var dom = $('<div data-template="nested-field-template" data-bind="source:this" />');

            var viewModel = kendo.observable({
                foo: {
                    bar: "bar"
                }
            });

            kendo.bind(dom, viewModel);

            viewModel.set("foo.bar", "boo");

            assert.equal(dom.text().trim(), "boo");
        });

        it("tracking changes when direct access and set are used (multiple get template)", function() {
            var dom = $('<div data-template="nested-field-template-multiple-gets" data-bind="source:this" />');

            var viewModel = kendo.observable({
                foo: {
                    bar: "bar"
                }
            });

            kendo.bind(dom, viewModel);

            viewModel.foo.set("bar", "baz");

            assert.equal(dom.text().trim(), "baz");
        });

        it("tracking changes when single set is used (multiple get template)", function() {
            var dom = $('<div data-bind="source:this" data-template="nested-field-template-multiple-gets" />');

            var viewModel = kendo.observable({
                foo: {
                    bar: "bar"
                }
            });

            kendo.bind(dom, viewModel);

            viewModel.set("foo.bar", "boo");

            assert.equal(dom.text().trim(), "boo");
        });

        it("tracking changes in dependent fields", function() {
            var dom = $('<div data-bind="text:computed" />');

            var viewModel = kendo.observable({
                foo: "foo",
                bar: "bar",
                computed: function() {
                    return this.get("foo") + this.get("bar");
                }
            });

            kendo.bind(dom, viewModel);

            viewModel.set("foo", "boo");

            assert.equal(dom.text().trim(), "boobar");
        });


        it("model is not updated after target is destroyed", function() {
            var dom = $('<input data-bind="value:foo" />');

            var viewModel = kendo.observable({ foo: "foo" });

            kendo.bind(dom, viewModel);

            kendo.unbind(dom);

            dom.val("bar");
            dom.trigger("change");

            assert.equal(viewModel.foo, "foo");
        });

        it("UI element is not updated after unbind", function() {
            var dom = $('<input data-bind="value:foo" />');

            var viewModel = kendo.observable({ foo: "foo" });

            kendo.bind(dom, viewModel);

            kendo.unbind(dom);

            viewModel.set("foo", "bar");

            assert.equal(dom.val(), "foo");
        });

        it("changing a field does not trigger changing of another field starting with the same name", function() {
            var viewModel = kendo.observable({
                foo1: [{ name: "foo" }, { name: "bar" }]
            });

            var calls = 0;

            kendo.data.binders.select.source = kendo.data.Binder.extend({
                refresh: function() {
                    calls++;
                }
            });

            var dom = $('<select data-value-field="name" data-bind="source: foo1"/>');

            kendo.bind(dom, viewModel);

            viewModel.trigger("change", { field: "foo" });

            assert.equal(calls, 1);
        });

        it("value binding sets a field which is initially undefined", function() {
            var viewModel = kendo.observable({});

            var dom = $('<input data-bind="value: foo">');

            kendo.bind(dom, viewModel);

            dom.val("foo").trigger("change");
            assert.equal(viewModel.foo, "foo");
        });

        it("tracks changes of template bound to parent field", function() {
            var dom = $('<ul data-bind="source: items" data-template="ul-template"></ul>');

            var viewModel = kendo.observable({
                root: "foo",
                items: [{}]
            });

            kendo.bind(dom, viewModel);
            viewModel.set("root", "bar");
            assert.equal(dom.find("li").text(), viewModel.root);
        });

        it("parent properties are invoked with the current item", function() {
            var dom = $('<ul data-bind="source: items" data-template="ul-template-alias"></ul>');

            var viewModel = kendo.observable({
                root: function(item) {
                },
                rootAlias: function(item) {
                    assert.equal(item, viewModel.items[0]);
                    return this.get("root");
                },
                items: [{}]
            });

            kendo.bind(dom, viewModel);
            viewModel.set("root", "bar");
        });

        it("tracks changes of parent field bound to dependent parent field", function() {
            var dom = $('<ul data-bind="source: items" data-template="ul-template-alias"></ul>');

            var viewModel = kendo.observable({
                root: "foo",
                rootAlias: function() {
                    return this.get("root");
                },
                items: [{}]
            });

            kendo.bind(dom, viewModel);

            viewModel.set("root", "bar");

            assert.equal(dom.find("li").text(), "bar");
        });

        it("tracks changes of parent field bound to dependent parent field", function() {
            var dom = $('<ul data-bind="source: items" data-template="ul-template-alias"></ul>');

            var viewModel = kendo.observable({
                root: "foo",
                rootAlias: function(item) {
                    return item.get("foo");
                },
                items: [{ foo: "foo" }]
            });

            kendo.bind(dom, viewModel);

            viewModel.items[0].set("foo", "bar");

            assert.equal(dom.find("li").text(), "bar");
        });

        it("tracks changes of element bound to parent field within a child template", function() {
            var dom = $('<div><span data-bind="text:root"></span><ul data-bind="source: items" data-template="ul-input-template"></ul></div>');

            var viewModel = kendo.observable({
                root: "foo",
                items: [{ bar: "baz" }]
            });

            kendo.bind(dom, viewModel);

            dom.find("input").val("moo").change();

            assert.equal(dom.find("span").text(), "moo");
        });

        it("tracks changes of element bound to parent nested field within a child template", function() {
            var dom = $('<div><span data-bind="text:root.child"></span><ul data-bind="source: items" data-template="ul-input-child-template"></ul></div>');

            var viewModel = kendo.observable({
                root: { child: "foo" },
                items: [{ bar: "baz" }]
            });

            kendo.bind(dom, viewModel);

            dom.find("input").val("moo").change();

            assert.equal(dom.find("span").text(), "moo");
        });


        it("event handlers are detached when the binding is changed", function() {
            var observable = kendo.observable({
                handler: {
                }
            });

            stub(observable.handler, "method");

            var dom = $('<span data-bind="click: handler.method"></span>');

            kendo.bind(dom, observable);

            var handler = observable.handler;

            var other = kendo.observable({
                method: function() { }
            });

            observable.set("handler", other);

            dom.trigger("click");

            assert.equal(handler.calls("method"), 0);
        });

        it("tracking changes of bindings containing function calls", function() {
            var observable = kendo.observable({
                foo: {
                    bar: "foo"
                },
                baz: function() {
                    return this.get("foo");
                }
            });

            var dom = $('<span data-bind="text: baz().bar">');

            kendo.bind(dom, observable);

            observable.set("baz().bar", "bar");

            assert.equal(dom.text(), "bar");
        });

        var date = $('<input type="date">');

        if (date[0].type == "date") {
            it("changing the value of input type date updates the view model with a valid JavaScript Date", function() {
                var observable = kendo.observable({
                    date: new Date("2013/5/4")
                });

                var dom = $('<input type="date" data-bind="value: date">');

                kendo.bind(dom, observable);

                dom.val("2013-06-05").trigger("change");

                assert.equal(observable.date.getMonth(), 5);
                assert.equal(observable.date.getDate(), 5);
            });
        }

        var datetime = $('<input type="datetime-local">');

        if (datetime[0].type == "datetime-local") {


            it("checking checkbox adds the datetime-local value to the view model", function() {
                var dom = $('<input type="checkbox" data-type="datetime-local" value="2015-02-13T01:00:00" data-bind="checked:foo"/>');

                var viewModel = kendo.observable({ foo: [] });

                kendo.bind(dom, viewModel);

                dom.attr("checked", true);
                dom.trigger("change");

                assert.deepEqual(viewModel.foo[0], kendo.parseDate("2015-02-13T01:00:00", ["yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mm"]));
            });

            it("changing radiobutton datetime-local value updates the view model", function() {
                var dom = $('<input type="radio" data-type="datetime-local" value="2015-02-13T01:00:00"  data-bind="checked:foo"/>');

                var viewModel = kendo.observable({ foo: new Date() });

                kendo.bind(dom, viewModel);

                dom.attr("checked", true);
                dom.trigger("change");

                assert.deepEqual(viewModel.foo, kendo.parseDate("2015-02-13T01:00:00", ["yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mm"]));
            });

            it("changing the datetime-local type input value updates the view model", function() {
                var dom = $('<input type="datetime-local" data-type="datetime-local" data-bind="value:foo" />');

                var viewModel = kendo.observable({ foo: new Date() });

                kendo.bind(dom, viewModel);

                dom.val("2015-02-13T01:00:00");
                dom.trigger("change");

                assert.deepEqual(viewModel.foo, kendo.parseDate("2015-02-13T01:00:00", ["yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mm"]));
            });

            it("changing the value of pre populated datetime-local type multi select updates the view model", function() {
                var dom = $('<select multiple="multiple" data-type="datetime-local" data-bind="value:foo"><option value="2015-02-13T01:00:00">1</option><option value="2015-01-13T01:00:00">2</option>');

                var viewModel = kendo.observable({ foo: [] });

                kendo.bind(dom, viewModel);

                dom.find("option").attr("selected", "selected");
                dom.trigger("change");

                assert.deepEqual(viewModel.foo[0], kendo.parseDate("2015-02-13T01:00:00", ["yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mm"]));
                assert.deepEqual(viewModel.foo[1], kendo.parseDate("2015-01-13T01:00:00", ["yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mm"]));
            });

            it("changing the value of input type datetime-local updates the view model with a valid JavaScript Date", function() {
                var observable = kendo.observable({
                    date: new Date("2013/5/4")
                });

                var dom = $('<input type="datetime-local" data-bind="value: date">');

                kendo.bind(dom, observable);

                dom.val("2013-06-05T23:13:40").trigger("change");

                assert.equal(observable.date.getMonth(), 5);
                assert.equal(observable.date.getDate(), 5);
                assert.equal(observable.date.getHours(), 23);
                assert.equal(observable.date.getMinutes(), 13);
                assert.equal(observable.date.getSeconds(), 40);
            });

            it("changing the value of input type datetime-local updates the view model with a valid JavaScript Date - date time without seconds", function() {
                var observable = kendo.observable({
                    date: new Date("2013/5/4")
                });

                var dom = $('<input type="datetime-local" data-bind="value: date">');

                kendo.bind(dom, observable);

                dom.val("2013-06-05T23:13").trigger("change");

                assert.equal(observable.date.getMonth(), 5);
                assert.equal(observable.date.getDate(), 5);
                assert.equal(observable.date.getHours(), 23);
                assert.equal(observable.date.getMinutes(), 13);
                assert.equal(observable.date.getSeconds(), 00);
            });

        }

        var number = $('<input type="number">');

        if (number[0].type == "number") {
            it("changing the value of input type number updates the view model with a valid Number", function() {
                var dom = $('<input type="number" data-bind="value: number">');

                var observable = kendo.observable({
                    number: 0
                });

                kendo.bind(dom, observable);

                dom.val("3.14").trigger("change");

                assert.strictEqual(observable.number, 3.14);
            });

            it("changing the value of input type number and data-type 'boolean' updates the view model with a valid Boolean", function() {
                var dom = $('<input type="number" data-type="boolean" data-bind="value: number">');

                var observable = kendo.observable({
                    number: 0
                });

                kendo.bind(dom, observable);

                dom.val(1).trigger("change");

                assert.strictEqual(observable.number, true);
            });
        }

    });
}());
