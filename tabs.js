document.addEventListener("DOMContentLoaded", function () {
    let hash = window.location.hash;
    if (hash) {
        let activeTab = document.querySelector(`a[href="${hash}"]`);
        if (activeTab) {
            new bootstrap.Tab(activeTab).show();
        }
    }
    
    document.querySelectorAll(".nav-link").forEach(tab => {
        tab.addEventListener("click", function (event) {
            event.preventDefault();
            let tabTarget = this.getAttribute("href");
            new bootstrap.Tab(this).show();
            history.pushState(null, null, tabTarget);
        });
    });

    function updateClassSelection(selectedClass) {
        console.log("Selected class:", selectedClass);
        // Call API or update charts dynamically here
    }

    document.getElementById('classSelect').addEventListener('change', function() {
        var selectedClass = this.value;
        updateClassSelection(selectedClass);
        window.location.href = "/?class=" + encodeURIComponent(selectedClass);
    });

    document.getElementById('classSelectAssignments').addEventListener('change', function() {
        var selectedClass = this.value;
        updateClassSelection(selectedClass);
        window.location.href = "/?class=" + encodeURIComponent(selectedClass);
    });

    document.getElementById('classSelectExam').addEventListener('change', function() {
        var selectedClass = this.value;
        updateClassSelection(selectedClass);
        window.location.href = "/?class=" + encodeURIComponent(selectedClass);
    });
});