package team.project.redboost.services;

import team.project.redboost.entities.Record;
import team.project.redboost.repositories.RecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecordServiceImpl implements RecordService {

    private final RecordRepository recordRepository;

    @Autowired
    public RecordServiceImpl(RecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    @Override
    public Record createRecord(Record record) {
        return recordRepository.save(record);
    }

    @Override
    public List<Record> getAllRecords() {
        return recordRepository.findAll();
    }

    @Override
    public Optional<Record> getRecordById(Long id) {
        return recordRepository.findById(id);
    }

    @Override
    public Record updateRecord(Long id, Record record) {
        return recordRepository.findById(id)
                .map(existingRecord -> {
                    existingRecord.setUrlVideo(record.getUrlVideo());
                    existingRecord.setPdfName(record.getPdfName());
                    existingRecord.setPdfData(record.getPdfData());
                    existingRecord.setPdfType(record.getPdfType());
                    existingRecord.setMeeting(record.getMeeting());
                    return recordRepository.save(existingRecord);
                })
                .orElseThrow(() -> new RuntimeException("Record not found with id: " + id));
    }

    @Override
    public void deleteRecord(Long id) {
        recordRepository.deleteById(id);
    }
}