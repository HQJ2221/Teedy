package com.sismics.docs.core.dao;

import com.sismics.docs.core.model.jpa.RegistrationRequest;
import com.sismics.util.context.ThreadLocalContext;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * User registration request DAO.
 *
 * @author jtremeaux
 */
public class RegistrationRequestDao {

    /**
     * Creates a new user registration request.
     *
     * @param request User registration request to create
     * @return Request ID
     */
    public String create(RegistrationRequest request) {
        request.setId(UUID.randomUUID().toString());
        request.setCreateDate(new Date());
        EntityManager em = ThreadLocalContext.get().getEntityManager();
        em.persist(request);
        return request.getId();
    }

    /**
     * Gets a registration request by ID.
     *
     * @param id Request ID
     * @return UserRegisterRequest or null if not found
     */
    public RegistrationRequest getById(String id) {
        EntityManager em = ThreadLocalContext.get().getEntityManager();
        try {
            return em.find(RegistrationRequest.class, id);
        } catch (NoResultException e) {
            return null;
        }
    }

    /**
     * Gets a registration request by email.
     *
     * @param email Email address
     * @return UserRegisterRequest or null if not found
     */
    public RegistrationRequest getByEmail(String email) {
        EntityManager em = ThreadLocalContext.get().getEntityManager();
        Query q = em.createQuery("select urr from RegistrationRequest urr where urr.email = :email");
        q.setParameter("email", email);
        try {
            return (RegistrationRequest) q.getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    /**
     * Gets all pending registration requests.
     *
     * @return List of pending UserRegisterRequest
     */
    public List<RegistrationRequest> getPendingRequests() {
        EntityManager em = ThreadLocalContext.get().getEntityManager();
        Query q = em.createQuery("select urr from RegistrationRequest urr where urr.status = :status order by urr.createDate asc");
        q.setParameter("status", "PENDING");
        return q.getResultList();
    }

    /**
     * Updates a registration request.
     *
     * @param request User registration request to update
     * @return Updated UserRegisterRequest
     */
    public RegistrationRequest update(RegistrationRequest request) {
        EntityManager em = ThreadLocalContext.get().getEntityManager();
        return em.merge(request);
    }
}