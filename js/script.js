$(document).ready(function () {
    var rawData = [];
    var header = ["Journal Title", "eISSN", "Publisher", "Amount Funded", "Campuses Covered", "Coverage Years", "Link to Agreement"];
    var columns = [
        { title: "Journal Title", data: 1 },
        { title: "eISSN", data: 2 },
        { title: "Publisher", data: 0 },
        { title: "Amount Funded", data: 3 },
        { title: "Campuses Covered", data: 4 },
        { title: "Coverage Years", data: 6 },
        { title: "Link to Agreement", data: 5 }
    ];

    var selectedPublishers = [];
    var selectedCampuses = [];

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        if (settings.nTable.id !== 'apcTable') {
            return true;
        }
        var publisher = rawData[dataIndex] ? rawData[dataIndex][0] : '';
        var campuses = rawData[dataIndex] ? rawData[dataIndex][4] : '';
        // Publisher filter
        if (selectedPublishers.length === 0) {
            return false;
        }
        if (selectedPublishers.indexOf(publisher) === -1) {
            return false;
        }
        // Campus filter
        if (selectedCampuses.length > 0) {
            var campusList = campuses.split(/,\s*/);
            var found = campusList.some(function (campus) {
                return selectedCampuses.indexOf(campus) !== -1;
            });
            if (!found) return false;
        }
        return true;
    });

    var table = $('#apcTable').DataTable({
        ajax: {
            url: "data.json",
            dataSrc: function (json) {
                rawData = json.data;
                populatePublisherFilters(json.data);
                populateCampusFilters(json.data);
                if (selectedPublishers.length === 0) {
                    var allPublishers = [];
                    json.data.forEach(function (row) {
                        var publisher = row[0];
                        if (publisher && allPublishers.indexOf(publisher) === -1) {
                            allPublishers.push(publisher);
                        }
                    });
                    selectedPublishers = allPublishers;
                }
                if (selectedCampuses.length === 0) {
                    var allCampuses = [];
                    json.data.forEach(function (row) {
                        var campuses = row[4];
                        if (campuses) {
                            campuses.split(/,\s*/).forEach(function (campus) {
                                if (campus && allCampuses.indexOf(campus) === -1) {
                                    allCampuses.push(campus);
                                }
                            });
                        }
                    });
                    selectedCampuses = allCampuses;
                }
                return json.data;
            }
        },
        columns: columns,
        pageLength: 5,
        lengthMenu: [5, 10, 25, 50],
        order: [[1, 'asc']],
        autoWidth: false,
        language: {
            search: "Search by Journal Title, eISSN, or Campus (i.e., 0010-0285):"
        },
        columnDefs: [
            {
                "targets": [3, 5, 6],
                "searchable": false
            },
            {
                "targets": 6,
                "width": "150px",
                "render": function (data, type, row) {
                    if (type === 'display' && data) {
                        return '<a href="' + data + '" target="_blank">View<span class="material-symbols-rounded">open_in_new</span></a>';
                    }
                    return data;
                }
            }
        ]
    });
    function populateCampusFilters(data) {
        var campuses = [];
        data.forEach(function (row) {
            var campusField = row[4];
            if (campusField) {
                campusField.split(/,\s*/).forEach(function (campus) {
                    if (campus && campuses.indexOf(campus) === -1) {
                        campuses.push(campus);
                    }
                });
            }
        });
        campuses.sort();

        var filtersHtml = '';
        filtersHtml += '<div class="d-flex align-items-center mb-2">'
            + '<button type="button" class="anchor-button p-0 me-2" id="applyAllCampuses"><b>Apply All</b></button>'
            + '<button type="button" class="anchor-button p-0" id="removeAllCampuses"><b>Remove All</b></button>'
            + '</div>';
        filtersHtml += '<hr class="my-2">';
        campuses.forEach(function (campus, index) {
            filtersHtml += '<div class="form-check">';
            filtersHtml += '<input class="form-check-input campus-checkbox" type="checkbox" id="campus_' + index + '" value="' + campus + '" checked>';
            filtersHtml += '<label class="form-check-label" for="campus_' + index + '">' + campus + '</label>';
            filtersHtml += '</div>';
        });
        $('#campusDropdownContent').html(filtersHtml);

        // Prevent dropdown from closing on checkbox/label/button click
        $('#campusDropdownContent').on('click', 'input, label, button', function (e) {
            e.stopPropagation();
        });
        $('.campus-checkbox').on('change', function () {
            filterTable();
        });
        $('#applyAllCampuses').on('click', function (e) {
            e.preventDefault();
            $('.campus-checkbox').prop('checked', true);
            filterTable();
        });
        $('#removeAllCampuses').on('click', function (e) {
            e.preventDefault();
            $('.campus-checkbox').prop('checked', false);
            filterTable();
        });
    }

    function populatePublisherFilters(data) {
        var publishers = [];
        data.forEach(function (row) {
            var publisher = row[0];
            if (publisher && publishers.indexOf(publisher) === -1) {
                publishers.push(publisher);
            }
        });
        publishers.sort();

        var filtersHtml = '';
        filtersHtml += '<div class="d-flex align-items-center mb-2">'
            + '<button type="button" class="anchor-button p-0 me-2" id="applyAllPublishers"><b>Apply All</b></button>'
            + '<button type="button" class="anchor-button p-0" id="removeAllPublishers"><b>Remove All</b></button>'
            + '</div>';
        filtersHtml += '<hr class="my-2">';
        publishers.forEach(function (publisher, index) {
            filtersHtml += '<div class="checkbox-option">';
            filtersHtml += '<input type="checkbox" class="publisher-checkbox" id="pub_' + index + '" value="' + publisher + '" checked>';
            filtersHtml += '<label for="pub_' + index + '">' + publisher + '</label>';
            filtersHtml += '</div>';
        });
        $('#publisherDropdownContent').html(filtersHtml);

        // Prevent dropdown from closing on checkbox/label/button click
        $('#publisherDropdownContent').on('click', 'input, label, button', function (e) {
            e.stopPropagation();
        });
        $('.publisher-checkbox').on('change', function () {
            filterTable();
        });
        $('#applyAllPublishers').on('click', function (e) {
            e.preventDefault();
            $('.publisher-checkbox').prop('checked', true);
            filterTable();
        });
        $('#removeAllPublishers').on('click', function (e) {
            e.preventDefault();
            $('.publisher-checkbox').prop('checked', false);
            filterTable();
        });
    }

    function filterTable() {
        selectedPublishers = [];
        $('.publisher-checkbox:checked').each(function () {
            selectedPublishers.push($(this).val());
        });
        selectedCampuses = [];
        $('.campus-checkbox:checked').each(function () {
            selectedCampuses.push($(this).val());
        });
        table.draw();
    }
});