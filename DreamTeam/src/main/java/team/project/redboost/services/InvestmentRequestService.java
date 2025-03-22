package team.project.redboost.services;

import team.project.redboost.entities.InvestmentRequest;
import team.project.redboost.entities.InvestmentStatus;
import team.project.redboost.repositories.InvestmentRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

@Service
public class InvestmentRequestService {

    @Autowired
    private InvestmentRequestRepository investmentRequestRepository;

    // Create a new investment request
    public InvestmentRequest createRequest(InvestmentRequest request) {
        return investmentRequestRepository.save(request);
    }

    // Get all investment requests
    public List<InvestmentRequest> getAllRequests() {
        return investmentRequestRepository.findAll();
    }

    // Get investment requests for a specific investor
    public List<InvestmentRequest> getRequestsByInvestor(Long investorId) {
        return investmentRequestRepository.findByInvestorId(investorId);
    }

    // Get investment requests for a specific projet
    public List<InvestmentRequest> getRequestsByProjet(Long projetId) {  // Changed from getRequestsByStartup
        return investmentRequestRepository.findByProjetId(projetId);    // Changed from findByStartupId
    }

    public boolean deleteRequest(Long requestId) {
        if (investmentRequestRepository.existsById(requestId)) {
            investmentRequestRepository.deleteById(requestId);
            return true;
        }
        return false;
    }

    // Update the status of an investment request
    public InvestmentRequest updateRequestStatus(Long requestId, String status) {
        Optional<InvestmentRequest> request = investmentRequestRepository.findById(requestId);
        if (request.isPresent()) {
            InvestmentRequest updatedRequest = request.get();
            try {
                updatedRequest.setStatus(InvestmentStatus.valueOf(status.toUpperCase()));
                return investmentRequestRepository.save(updatedRequest);
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value", e);
            }
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment Request not found");
        }
    }
}