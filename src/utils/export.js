import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import { getExpoRuntimeInfo } from "./expo";

export const ExportUtils = {
  generateBlastReport: async (blasts, company, filterStatus = "All") => {
    try {
      if (!Array.isArray(blasts)) {
        console.error("Export failed: blasts is not an array");
        return false;
      }
      const companyName = company?.name || "Mine Blast Operations";
      const reportDate = new Date().toLocaleDateString();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                padding: 40px;
                color: #1A1F3A;
              }
              header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #FF9900;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .logo-container {
                display: flex;
                align-items: center;
              }
              .logo-icon {
                font-size: 32px;
                margin-right: 10px;
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
              }
              .report-info {
                text-align: right;
              }
              .report-title {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #1A1F3A;
              }
              .filter-tag {
                display: inline-block;
                background-color: #FF9900;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th {
                background-color: #F8F9FA;
                text-align: left;
                padding: 12px;
                border-bottom: 1px solid #ECEFF1;
                font-weight: bold;
                font-size: 14px;
              }
              td {
                padding: 12px;
                border-bottom: 1px solid #ECEFF1;
                font-size: 13px;
                vertical-align: top;
              }
              .status-scheduled { color: #FF9900; font-weight: bold; }
              .status-completed { color: #27AE60; font-weight: bold; }
              .status-failed { color: #E74C3C; font-weight: bold; }
              
              .stats-container {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                gap: 20px;
              }
              .stat-box {
                flex: 1;
                background-color: #F8F9FA;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
              }
              .stat-value {
                font-size: 20px;
                font-weight: bold;
                display: block;
              }
              .stat-label {
                font-size: 12px;
                color: #95A5A6;
                text-transform: uppercase;
              }
              footer {
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                color: #95A5A6;
                border-top: 1px solid #ECEFF1;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <header>
              <div class="logo-container">
                <span class="logo-icon">🧞</span>
                <span class="company-name">${companyName}</span>
              </div>
              <div class="report-info">
                <div>Date: ${reportDate}</div>
              </div>
            </header>

            <h1 class="report-title">Blast Operations Report</h1>
            <div style="margin-bottom: 30px;">
              <span class="filter-tag">Filter: ${filterStatus}</span>
            </div>

            <div class="stats-container">
              <div class="stat-box">
                <span class="stat-value">${blasts.length}</span>
                <span class="stat-label">Total Operations</span>
              </div>
              <div class="stat-box">
                <span class="stat-value">${blasts.filter((b) => b.status === "Completed").length}</span>
                <span class="stat-label">Completed</span>
              </div>
              <div class="stat-box">
                <span class="stat-value">${blasts.filter((b) => b.status === "Scheduled").length}</span>
                <span class="stat-label">Scheduled</span>
              </div>
              <div class="stat-box">
                <span class="stat-value">${blasts.filter((b) => b.status === "Failed").length}</span>
                <span class="stat-label">Failed</span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Title / Description</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                ${blasts
                  .map(
                    (blast) => `
                  <tr>
                    <td>
                      <strong>${blast.title || "Untitled"}</strong><br/>
                      <small>${blast.description || ""}</small>
                    </td>
                    <td>${blast.targetArea || "N/A"}</td>
                    <td>${blast.launchDate || "TBD"}</td>
                    <td class="status-${(blast.status || "Unknown").toLowerCase()}">${blast.status}</td>
                    <td>
                      Size: ${blast.blastSize || "N/A"} kg<br/>
                      Holes: ${blast.holes || 0}<br/>
                      By: ${blast.createdByName || "N/A"}
                    </td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>

            <footer>
              Generated by BlastXApp - Mine Management Solutions
            </footer>
          </body>
        </html>
      `;

      const { isExpoGo } = getExpoRuntimeInfo();

      if (isExpoGo) {
        console.warn(
          "PDF export is running in Expo Go; native sharing support may be limited.",
        );
      }

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (Platform.OS === "ios") {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      } else {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
      }

      return true;
    } catch (error) {
      console.error("Error generating PDF:", error);

      const { isExpoGo } = getExpoRuntimeInfo();
      if (isExpoGo) {
        Alert.alert(
          "Expo Go export limited",
          "PDF export uses native Expo modules and may not work in Expo Go. Use a development build for full export support.",
        );
        return false;
      }

      Alert.alert(
        "Export failed",
        "Could not generate the PDF report. Please try again.",
      );
      return false;
    }
  },
};
