// infoWidget
$("#infoWidget .tutorial").click(function() {
    introJs().setOptions({
        showStepNumbers: false,
        steps: [
            {
                element: document.querySelector("#infoWidget"),
                intro: "<h4>System information widget</h4><br/><p>Displays information on the currently <b>selected</b> Tripwire system (not the in-game system).</p>"
            },
            {
                element: document.querySelector("#infoGeneral"),
                intro: "<p>This section includes the system name, security rating, region, and owning faction.</p>"
            },
            {
                element: document.querySelector("#activityGraph"),
                intro: "<p>This is the graph containing historical ship jump and kill information.</p>"
            },
            {
                element: $("#activityGraph svg > g > g:nth-child(5)")[0],
                intro: "<p>Each value can be toggled by clicking these keys to drill down the graph into finer detail.</p>"
            },
            {
                element: document.querySelector("#activityGraphControls"),
                intro: "<p>Select different lengths of historical data to show</p>"
            },
            {
                element: document.querySelector("#infoStatics"),
                intro: "<p>If a wormhole system is selected, the static wormholes will appear here.</p>"
            },
            {
                element: document.querySelector("#infoLinks"),
                intro: "<p>These are some quick links to various sites for this specific system.</p>"
            }
        ]
    }).start();
});

// signaturesWidget
$("#signaturesWidget .tutorial").click(function() {
    introJs().setOptions({
        showStepNumbers: false,
        steps: [
            {
                element: document.querySelector("#signaturesWidget"),
                intro: "<h4>System signatures widget</h4><br/><p>Displays all signatures and wormholes in the currently <b>selected</b> Tripwire system (not the in-game system).</p>"
            },
            {
                element: document.querySelector("#add-signature2"),
                intro: "<p>Add new signatures or wormholes manually by clicking the + icon.</p>"
            },
            {
                element: document.querySelector("#toggle-automapper"),
                intro: "<p>Toggle the Auto-mapper feature on (orange) or off. (more details here)</p>"
            },
            {
                element: document.querySelector("#signature-count"),
                intro: "<p>Shows the current count of signatures.</p>"
            },
            {
                element: document.querySelector("#undo"),
                intro: "<p>Click or use the keyboard shortcut CTRL-Z to undo the last changes made to these signatures (this includes clipboard pasted changes).</p><br/><p>You can undo multiple times as history is kept in the browser.</p>"
            },
            {
                element: document.querySelector("#redo"),
                intro: "<p>Click or use the keyboard shortcut CTRL-Y to redo the last changes made to these signatures (this includes clipboard pasted changes).</p><br/><p>You can redo multiple times as history is kept in the browser.</p>"
            },
            {
                element: document.querySelector("#sigTable"),
                intro: "<p>Each column can be sorted by clicking the column label, sort by multiple columns by holding the shift key.</p><br/><p>Right-click a column to change the text-alignment.</p>"
            }
        ]
    }).start();
});
