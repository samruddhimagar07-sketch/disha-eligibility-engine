package com.disha.interfaces;

/**
 * Interface contract for exporting exam metadata and evaluation reports.
 */
public interface Exportable {

    /**
     * Serializes object state into a standardized CSV record format.
     */
    String toCsvRecord();

    /**
     * Serializes object state into JSON format for API or export consumption.
     */
    String toJson();
}
