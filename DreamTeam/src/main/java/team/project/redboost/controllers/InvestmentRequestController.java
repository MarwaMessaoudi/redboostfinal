package team.project.redboost.controllers;

import org.springframework.http.ResponseEntity;
import team.project.redboost.entities.InvestmentRequest;
import team.project.redboost.services.InvestmentRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investment-requests")
public class InvestmentRequestController {

    @Autowired
    private InvestmentRequestService investmentRequestService;

    @PostMapping
    public InvestmentRequest createRequest(@RequestBody InvestmentRequest request) {
        return investmentRequestService.createRequest(request);
    }

    @GetMapping
    public List<InvestmentRequest> getAllRequests() {
        List<InvestmentRequest> requests = investmentRequestService.getAllRequests();
        System.out.println("Requests: " + requests); // Log the response
        return requests;
    }

    @GetMapping("/investor/{investorId}")
    public List<InvestmentRequest> getRequestsByInvestor(@PathVariable Long investorId) {
        return investmentRequestService.getRequestsByInvestor(investorId);
    }

    @GetMapping("/projet/{projetId}")  // Changed from /startup/{startupId}
    public List<InvestmentRequest> getRequestsByProjet(@PathVariable Long projetId) {  // Changed from getRequestsByStartup
        return investmentRequestService.getRequestsByProjet(projetId);  // Changed from getRequestsByStartup
    }

    @PutMapping("/{requestId}/status")
    public InvestmentRequest updateStatus(@PathVariable Long requestId, @RequestParam String status) {
        return investmentRequestService.updateRequestStatus(requestId, status);
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<String> deleteInvestmentRequest(@PathVariable Long requestId) {
        boolean deleted = investmentRequestService.deleteRequest(requestId);
        if (deleted) {
            return ResponseEntity.ok("Investment request deleted successfully.");
        } else {
            return ResponseEntity.badRequest().body("Failed to delete request.");
        }
    }
}