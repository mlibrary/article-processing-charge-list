$(document).ready(function () {
    var rawData = [];
    var header = ["Journal Title", "eISSN", "Publisher", "Discount or Waiver Amount", "Campuses Covered", "Coverage Years", "Agreement Info"];
    var columns = [
        { title: "Journal Title", data: 1 },
        { title: "eISSN", data: 2 },
        { title: "Publisher", data: 0 },
        { title: "Discount or Waiver Amount", data: 3 },
        { title: "Campuses Covered", data: 4 },
        { title: "Coverage Years", data: 6 },
        { title: "Agreement Info", data: 5 }
    ];

    var selectedPublishers = [];
    var selectedCampuses = [];
    var allPublishersCount = 0;
    var allCampusesCount = 0;
    var onlyFullyFunded = false; // state for 100% funded filter

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        if (settings.nTable.id !== 'apcTable') {
            return true;
        }
        var publisher = rawData[dataIndex] ? rawData[dataIndex][0] : '';
        var campuses = rawData[dataIndex] ? rawData[dataIndex][4] : '';
        var amountFunded = rawData[dataIndex] ? rawData[dataIndex][3] : '';
        // Publisher filter
        if (selectedPublishers.length === 0) {
            return false;
        }
        if (selectedPublishers.indexOf(publisher) === -1) {
            return false;
        }
        // Campus filter
        if (selectedCampuses.length === 0) {
            return false;
        }
        var campusList = campuses.split(/,\s*/);
        var found = campusList.some(function (campus) {
            return selectedCampuses.indexOf(campus) !== -1;
        });
        if (!found) return false;
        // 100% funded filter
        if (onlyFullyFunded) {
            var normalized = '' + amountFunded;
            normalized = normalized.trim();
            normalized = normalized.replace(/[$,\s]/g, '');
            var isHundred = false;
            if (/^100%?$/.test(normalized)) {
                isHundred = true;
            } else {
                var num = parseFloat(normalized.replace(/%/, ''));
                if (!isNaN(num) && num === 100) {
                    isHundred = true;
                }
            }
            if (!isHundred) return false;
        }
        return true;
    });

    var table = $('#apcTable').DataTable({
        layout: {
            top6Start: function () {
                let filterContainer = document.createElement('div');
                filterContainer.innerHTML = '<h2 id="searchandfilter">Search and Filter</h2>';
                return filterContainer;
            },
            top5Start: {
                search: {
                    placeholder: 'Search',
                }
            },
            top4Start: function () {
                let filterContainer = document.createElement('div');
                filterContainer.innerHTML = CreateFilterContainer();
                let summaryDiv = document.createElement('div');
                summaryDiv.id = 'filterSummaryContainer';
                summaryDiv.style.minHeight = '2.2em';
                summaryDiv.style.display = 'flex';
                summaryDiv.style.alignItems = 'center';
                summaryDiv.innerHTML = '<span id="filterSummaryText"></span>' +
                    '<button id="clearAllFiltersBtn" class="anchor-button">Clear all filters</button>';
                summaryDiv.style.visibility = 'hidden';
                filterContainer.appendChild(summaryDiv);
                return filterContainer;
            },
            top3: function () {
                let separator = document.createElement('hr');
                separator.className = 'horizontal-line-dt mb-4';
                return separator;
            },
            top2Start: function () {
                let filterContainer = document.createElement('div');
                filterContainer.innerHTML = '<h2>Search Results</h2>';
                return filterContainer;
            },
            top1Start: function () {
                let filterContainer = document.createElement('div');
                filterContainer.innerHTML = '<div class="info">Learn more about <a href="#eissnInfo">EISSN</a>, <a href="#discountOrWaiverInfo">Discount or Waiver Amount</a>, and <a href="#coverageYearsInfo">Coverage Years</a>.</div>';
                return filterContainer;
            },
            topStart: 'info',
            topEnd: 'pageLength',
            bottomStart: 'info',
            bottomEnd: 'paging'
        },
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
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50],
        order: [[1, 'asc']],
        autoWidth: false,
        responsive: true,
        language: {
            search: "Search by Journal Title, or eISSN (i.e., 0010-0285):",
            emptyTable: CreateNoResultsMessage(),
            zeroRecords: CreateNoResultsMessage(),
        },
        initComplete: function() {
            // Add autocomplete attribute to search input
            $('.dt-search input[type="search"]').attr('autocomplete', 'on');
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
                        return '<a href="' + data + '" target="_blank">Info about ' + row[0] + '<span class="material-symbols-rounded">open_in_new</span>' + ' agreement</a>';
                    }
                    return data;
                }
            }
        ]
    });

    $(document).on('change', '#onlyFullyFundedCheckbox', function () {
        onlyFullyFunded = this.checked;
        filterTable();
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
        allCampusesCount = campuses.length;

        var filtersHtml = '';
        filtersHtml += '<div class="d-flex align-items-center mb-2">'
            + '<button type="button" class="anchor-button p-0 me-2" id="applyAllCampuses"><b>Apply All</b></button>'
            + '<button type="button" class="anchor-button p-0" id="removeAllCampuses"><b>Remove All</b></button>'
            + '</div>';
        filtersHtml += '<hr class="my-2">';
        campuses.forEach(function (campus, index) {
            filtersHtml += '<div class="checkbox-option">';
            filtersHtml += '<input class="campus-checkbox" type="checkbox" id="campus_' + index + '" value="' + campus + '" checked>';
            filtersHtml += '<label for="campus_' + index + '">' + campus + '</label>';
            filtersHtml += '</div>';
        });
        $('#campusDropdownContent').html(filtersHtml);
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
        allPublishersCount = publishers.length;

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
        renderFilterSummary();
        table.draw();
    }

    function renderFilterSummary() {
        var pubCount = selectedPublishers.length;
        var campusCount = selectedCampuses.length;
        var show = (pubCount !== allPublishersCount || campusCount !== allCampusesCount || onlyFullyFunded);
        if (show) {
            var parts = [];
            parts.push(pubCount + ' publisher' + (pubCount !== 1 ? 's' : ''));
            parts.push(campusCount + ' campus' + (campusCount !== 1 ? 'es' : ''));
            if (onlyFullyFunded) {
                parts.push('only 100% covered');
            }
            var text = 'Filtering by ' + parts.join(' and ');
            $('#filterSummaryText').text(text);
            $('#filterSummaryContainer').css('visibility', 'visible');
        } else {
            $('#filterSummaryText').text('');
            $('#filterSummaryContainer').css('visibility', 'hidden');
        }
    }


    $(document).on('click', '#clearAllFiltersBtn', function () {
        $('.publisher-checkbox, .campus-checkbox').prop('checked', true);
        $('#onlyFullyFundedCheckbox').prop('checked', false);
        onlyFullyFunded = false;
        filterTable();
    });

    $(document).on('click', '#publisherDropdownContent input, #publisherDropdownContent label, #publisherDropdownContent button, #campusDropdownContent input, #campusDropdownContent label, #campusDropdownContent button', function (e) {
        e.stopPropagation();
    });

    $(document).on('change', '.publisher-checkbox, .campus-checkbox', function () {
        filterTable();
    });

    $(document).on('click', '#applyAllPublishers', function (e) {
        e.preventDefault();
        $('.publisher-checkbox').prop('checked', true);
        filterTable();
    });
    $(document).on('click', '#removeAllPublishers', function (e) {
        e.preventDefault();
        $('.publisher-checkbox').prop('checked', false);
        filterTable();
    });
    $(document).on('click', '#applyAllCampuses', function (e) {
        e.preventDefault();
        $('.campus-checkbox').prop('checked', true);
        filterTable();
    });
    $(document).on('click', '#removeAllCampuses', function (e) {
        e.preventDefault();
        $('.campus-checkbox').prop('checked', false);
        filterTable();
    });

    $(document).on('click', '#clearAllFiltersFromEmpty', function (e) {
        e.preventDefault();
        $('.publisher-checkbox, .campus-checkbox').prop('checked', true);
        $('#onlyFullyFundedCheckbox').prop('checked', false);
        onlyFullyFunded = false;
        table.search('').draw();
        filterTable();
    });
});

function CreateFilterContainer() {
    return `
        <div class="mb-2 mt-2 ms-1 d-flex flex-wrap gap-3">
            <div class="d-flex flex-column">
                <label for="publisherDropdown">Filter by Publisher:</label>
                <div class="dropdown d-inline-block me-3">
                <button class="button button--secondary" type="button" id="publisherDropdown" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    Select Publishers
                    <span class="material-symbols-rounded dropdown-icon">
                    arrow_drop_down
                    </span>
                </button>
                <ul class="dropdown-menu p-3" aria-labelledby="publisherDropdown"
                    style="min-width: 300px; max-height: 300px; overflow-y: auto;">
                    <li id="publisherDropdownContent"></li>
                </ul>
                </div>
            </div>
            <div class="d-flex flex-column">
                <label for="campusDropdown">Filter by Campus:</label>
                <div class="dropdown d-inline-block">
                    <button class="button button--secondary" type="button" id="campusDropdown" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        Select Campuses
                        <span class="material-symbols-rounded dropdown-icon">
                        arrow_drop_down
                        </span>
                    </button>
                    <ul class="dropdown-menu p-3" aria-labelledby="campusDropdown"
                        style="min-width: 300px; max-height: 300px; overflow-y: auto;">
                        <li id="campusDropdownContent"></li>
                    </ul>
                </div>
            </div>
            <div class="d-flex align-items-center ms-1 mt-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="onlyFullyFundedCheckbox" />
                    <label class="form-check-label" for="onlyFullyFundedCheckbox">Show only 100% covered</label>
                </div>
            </div>
        </div>
    `
}

function CreateNoResultsMessage() {
    return `
        <div style="text-align: center; padding: 2rem;">
            <h3 style="color: var(--color-neutral-300); margin-bottom: 1rem;">No matching records found</h3>
            <p style="color: var(--color-neutral-300); margin-bottom: 1.5rem;">Here are the most likely reasons:</p>
            <ol style="color: var(--color-neutral-300); text-align: left; max-width: 600px; margin: 0 auto 1.5rem auto;">
                <li style="color: var(--color-neutral-300); margin-bottom: 1rem;">
                    <strong>Journal Not Covered:</strong> The journal is not covered under centralized U-M Library or BTAA agreements. 
                    The journal may still be open access, but not managed through U-M Library and BTAA (Big Ten Academic Alliance) agreements. 
                    Visit <a href="https://guides.lib.umich.edu/c.php?g=1329501&p=9791037">APC Discounts for U-M Authors</a> for more information.
                </li>
                <li style="color: var(--color-neutral-300); margin-bottom: 1rem;">
                    <strong>Too Many Filters:</strong> You may have selected a publisher or campus filter that excludes the journal you're searching for. 
                    Try removing all active filters and searching again.
                </li>
                <li style="color: var(--color-neutral-300); margin-bottom: 1rem;">
                    <strong>Typo or Variant of Title:</strong> Check the spelling or title, or verify the journal's EISSN and use that instead.
                </li>
            </ol>
            <button id="clearAllFiltersFromEmpty" class="anchor-button">Clear all filters</button>
        </div>
    `;
}